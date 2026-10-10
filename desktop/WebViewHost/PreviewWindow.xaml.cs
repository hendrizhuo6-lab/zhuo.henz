using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace DomainOpsConsole.WebViewHost;

public sealed class PreviewNavigationResultEventArgs : EventArgs
{
    public PreviewNavigationResultEventArgs(string requestedUrl, bool isSuccess, string error)
    {
        RequestedUrl = requestedUrl;
        IsSuccess = isSuccess;
        Error = error;
    }

    public string RequestedUrl { get; }
    public bool IsSuccess { get; }
    public string Error { get; }
}

public partial class PreviewWindow : Window
{
    private Uri? _pendingUri;
    private string _requestedUrl = "";
    private bool _initialized;

    public PreviewWindow(Uri initialUri)
    {
        InitializeComponent();
        _pendingUri = initialUri;
        _requestedUrl = initialUri.AbsoluteUri;
        AddressBar.Text = initialUri.AbsoluteUri;
    }

    public event EventHandler<PreviewNavigationResultEventArgs>? NavigationFinished;

    public void NavigateTo(Uri uri)
    {
        _pendingUri = uri;
        AddressBar.Text = uri.AbsoluteUri;
        if (_initialized)
        {
            NavigateToCore(uri);
        }
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            await Browser.EnsureCoreWebView2Async();
            var core = Browser.CoreWebView2;
            core.Settings.IsStatusBarEnabled = false;
            core.NavigationStarting += Browser_NavigationStarting;
            core.NavigationCompleted += Browser_NavigationCompleted;
            core.NewWindowRequested += Browser_NewWindowRequested;
            core.HistoryChanged += (_, _) => UpdateNavigationButtons();
            _initialized = true;

            if (_pendingUri is not null)
            {
                NavigateToCore(_pendingUri);
            }
        }
        catch (Exception ex)
        {
            StatusText.Text = $"WebView2 gagal dimulai: {ex.Message}";
            NavigationFinished?.Invoke(this, new PreviewNavigationResultEventArgs(
                _requestedUrl,
                isSuccess: false,
                ex.Message));
        }
    }

    private void NavigateToCore(Uri uri)
    {
        if (Browser.CoreWebView2 is null)
        {
            return;
        }

        _requestedUrl = uri.AbsoluteUri;
        AddressBar.Text = _requestedUrl;
        StatusText.Text = $"Memuat {_requestedUrl}";
        Browser.CoreWebView2.Navigate(_requestedUrl);
    }

    private void Browser_NavigationStarting(object? sender, CoreWebView2NavigationStartingEventArgs e)
    {
        if (!TryGetWebUri(e.Uri, out _))
        {
            e.Cancel = true;
            StatusText.Text = "Hanya alamat HTTP dan HTTPS yang didukung.";
            NavigationFinished?.Invoke(this, new PreviewNavigationResultEventArgs(
                _requestedUrl,
                isSuccess: false,
                "Alamat non-HTTP/HTTPS diblokir."));
            return;
        }

        AddressBar.Text = e.Uri;
        StatusText.Text = $"Memuat {e.Uri}";
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        var error = e.IsSuccess ? "" : e.WebErrorStatus.ToString();
        StatusText.Text = e.IsSuccess ? $"Selesai: {Browser.Source}" : $"Gagal memuat: {error}";
        NavigationFinished?.Invoke(this, new PreviewNavigationResultEventArgs(_requestedUrl, e.IsSuccess, error));
        UpdateNavigationButtons();
    }

    private void Browser_NewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        e.Handled = true;
        if (!TryGetWebUri(e.Uri, out var target))
        {
            StatusText.Text = "Popup dengan alamat non-HTTP/HTTPS diblokir.";
            return;
        }

        var popup = new PreviewWindow(target) { Owner = this };
        popup.Show();
    }

    private void BackButton_Click(object sender, RoutedEventArgs e)
    {
        if (Browser.CoreWebView2?.CanGoBack == true)
        {
            Browser.CoreWebView2.GoBack();
        }
    }

    private void ForwardButton_Click(object sender, RoutedEventArgs e)
    {
        if (Browser.CoreWebView2?.CanGoForward == true)
        {
            Browser.CoreWebView2.GoForward();
        }
    }

    private void GoButton_Click(object sender, RoutedEventArgs e) => NavigateFromAddressBar();

    private void AddressBar_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            NavigateFromAddressBar();
        }
    }

    private void NavigateFromAddressBar()
    {
        var address = AddressBar.Text.Trim();
        if (!address.Contains("://", StringComparison.Ordinal))
        {
            address = $"https://{address}";
        }

        if (!TryGetWebUri(address, out var uri))
        {
            StatusText.Text = "Masukkan alamat HTTP atau HTTPS yang valid.";
            return;
        }

        NavigateTo(uri);
    }

    private void UpdateNavigationButtons()
    {
        if (Browser.CoreWebView2 is null)
        {
            return;
        }

        BackButton.IsEnabled = Browser.CoreWebView2.CanGoBack;
        ForwardButton.IsEnabled = Browser.CoreWebView2.CanGoForward;
    }

    private static bool TryGetWebUri(string value, out Uri uri)
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
