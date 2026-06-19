package com.suzume.game

import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enforce landscape orientation
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        
        super.onCreate(savedInstanceState)
        
        // Fullscreen immersive mode
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
        )

        // Root container to stack WebView and Splash Screen
        val rootLayout = FrameLayout(this)

        webView = WebView(this)
        rootLayout.addView(webView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))

        // Create Splash Screen Overlay
        val splashLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setBackgroundColor(android.graphics.Color.parseColor("#070e18")) // Dark twilight/space background
        }

        // Add App Icon
        val iconView = ImageView(this).apply {
            setImageResource(resources.getIdentifier("ic_launcher", "drawable", packageName))
            val size = (120 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                bottomMargin = (24 * resources.displayMetrics.density).toInt()
            }
        }
        splashLayout.addView(iconView)

        // Add Custom ProgressBar (accent color #8df0dc)
        val progressBar = ProgressBar(this).apply {
            isIndeterminate = true
            val colorStateList = android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#8df0dc"))
            indeterminateTintList = colorStateList
            val size = (48 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                bottomMargin = (16 * resources.displayMetrics.density).toInt()
            }
        }
        splashLayout.addView(progressBar)

        // Add Loading Text
        val loadingText = TextView(this).apply {
            text = "Closing the ruins..."
            setTextColor(android.graphics.Color.parseColor("#e6efef"))
            textSize = 18f
            letterSpacing = 0.2f
            gravity = android.view.Gravity.CENTER
        }
        splashLayout.addView(loadingText)

        rootLayout.addView(splashLayout, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))

        setContentView(rootLayout)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        
        // Auto-play audio without user interaction
        settings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Smoothly fade out the splash screen
                splashLayout.animate()
                    .alpha(0f)
                    .setDuration(800)
                    .withEndAction {
                        rootLayout.removeView(splashLayout)
                    }
                    .start()
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                return false
            }
        }
        
        webView.loadUrl("file:///android_asset/Suzume Doors.html")
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }
}
