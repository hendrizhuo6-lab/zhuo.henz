# Domain Ops Console WebView2

This Windows desktop host runs the existing dashboard in WebView2 and opens redirect previews in a separate native WebView2 window. Preview sites are top-level navigations in that window, so iframe-specific `X-Frame-Options` and CSP `frame-ancestors` restrictions do not apply.

## Requirements

- Windows 10 or later
- .NET 8 SDK
- Microsoft Edge WebView2 Runtime

## Run

From the repository root:

```powershell
dotnet run --project desktop\WebViewHost\DomainOpsConsole.WebView.csproj
```

Selecting a domain in **Redirect** opens or reuses the desktop WebView2 preview window. Its address bar, back/forward controls, page links, and popups are handled by the native browser control. Only HTTP and HTTPS URLs are allowed.

To publish a framework-dependent Windows build:

```powershell
dotnet publish desktop\WebViewHost\DomainOpsConsole.WebView.csproj -c Release -r win-x64 --self-contained false
```
