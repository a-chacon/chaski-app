package com.chaski.app

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {

  inner class ThemeBridge {
    @JavascriptInterface
    fun setTheme(isDark: Boolean, bgColor: String) {
      runOnUiThread {
        try {
          val color = Color.parseColor(bgColor)
          window.decorView.setBackgroundColor(color)
        } catch (_: Exception) {}

        WindowCompat.getInsetsController(window, window.decorView).apply {
          isAppearanceLightStatusBars = !isDark
          isAppearanceLightNavigationBars = !isDark
        }
      }
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    val rootView: View = findViewById(android.R.id.content)

    ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      val imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime())
      val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom

      val bottomPadding = if (imeVisible) imeHeight else systemBars.bottom

      v.setPadding(
        systemBars.left,
        systemBars.top,
        systemBars.right,
        bottomPadding
      )
      insets
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    webView.setBackgroundColor(0x00000000)
    webView.fitsSystemWindows = true
    webView.addJavascriptInterface(ThemeBridge(), "AndroidThemeBridge")
  }
}
