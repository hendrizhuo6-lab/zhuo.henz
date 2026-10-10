using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace DomainOpsConsole.WebViewHost;

public partial class MainWindow : Window
{
    private const string AppHostName = "domainops.local";
    private PreviewWindow? _previewWindow;

    public MainWindow()
    {
        InitializeComponent();
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            await DashboardWebView.EnsureCoreWebView2Async();
            var webRoot = Path.Combine(AppContext.BaseDirectory, "WebApp");
            if (!File.Exists(Path.Combine(webRoot, "index.html")))
            {
                throw new FileNotFoundException("Dashboard assets were not copied to the application folder.", webRoot);
            }

            DashboardWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                AppHostName,
                webRoot,
                CoreWebView2HostResourceAccessKind.DenyCors);
            DashboardWebView.CoreWebView2.Settings.AreDefaultScriptDialogsEnabled = true;
            DashboardWebView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            DashboardWebView.CoreWebView2.NavigationStarting += Dashboard_NavigationStarting;
            DashboardWebView.CoreWebView2.WebMessageReceived += Dashboard_WebMessageReceived;
            DashboardWebView.CoreWebView2.NewWindowRequested += Dashboard_NewWindowRequested;
            DashboardWebView.Source = new Uri($"https://{AppHostName}/index.html");
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                this,
                $"WebView2 could not be initialized.\n\n{ex.Message}\n\nInstall the Microsoft Edge WebView2 Runtime and try again.",
                "Domain Ops Console",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Close();
        }
    }

    private void Dashboard_NavigationStarting(object? sender, CoreWebView2NavigationStartingEventArgs e)
    {
        if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri) ||
            !string.Equals(uri.Host, AppHostName, StringComparison.OrdinalIgnoreCase) ||
            uri.Scheme != Uri.UriSchemeHttps)
        {
            e.Cancel = true;
        }
    }

    private void Dashboard_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        string requestedUrl = "";
        try
        {
            using var message = JsonDocument.Parse(e.WebMessageAsJson);
            var root = message.RootElement;
            if (!root.TryGetProperty("type", out var type) ||
                type.GetString() != "open-preview" ||
                !root.TryGetProperty("url", out var urlElement) ||
                !TryGetWebUri(urlElement.GetString(), out var target))
            {
                return;
            }

            requestedUrl = target.AbsoluteUri;
            OpenPreview(target);
            SendPreviewStatus(requestedUrl, success: true, "WebView window opened.");
        }
        catch (Exception ex)
        {
            SendPreviewStatus(requestedUrl, success: false, ex.Message);
        }
    }

    private void Dashboard_NewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        e.Handled = true;
        if (TryGetWebUri(e.Uri, out var target))
        {
            OpenPreview(target);
        }
    }

    private void OpenPreview(Uri target)
    {
        if (_previewWindow is null)
        {
            _previewWindow = new PreviewWindow(target);
            _previewWindow.Owner = this;
            _previewWindow.NavigationFinished += PreviewWindow_NavigationFinished;
            _previewWindow.Closed += (_, _) => _previewWindow = null;
            _previewWindow.Show();
            return;
        }

        _previewWindow.NavigateTo(target);
        if (!_previewWindow.IsVisible)
        {
            _previewWindow.Show();
        }
        _previewWindow.Activate();
    }

    private void PreviewWindow_NavigationFinished(object? sender, PreviewNavigationResultEventArgs e)
    {
        SendPreviewStatus(e.RequestedUrl, e.IsSuccess, e.Error);
    }

    private void SendPreviewStatus(string url, bool success, string error)
    {
        if (DashboardWebView.CoreWebView2 is null)
        {
            return;
        }

        var message = JsonSerializer.Serialize(new
        {
            type = "preview-status",
            url,
            success,
            error
        });
        DashboardWebView.CoreWebView2.PostWebMessageAsJson(message);
    }

    private static bool TryGetWebUri(string? value, out Uri uri)
    {
        if (Uri.TryCreate(value, UriKind.Absolute, out var parsed) &&
            (parsed.Scheme == Uri.UriSchemeHttp || parsed.Scheme == Uri.UriSchemeHttps))
        {
            uri = parsed;
            return true;
        }

        uri = null!;
        return false;
    }
}
