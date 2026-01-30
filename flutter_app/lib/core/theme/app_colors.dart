import 'package:flutter/material.dart';

/// アプリ全体で使用するカラーパレット
class AppColors {
  // Primary colors (iOS Blue base)
  static const Color primary = Color(0xFF007AFF);
  static const Color primaryDark = Color(0xFF0051D5);
  static const Color primaryLight = Color(0xFF4DA2FF);

  // Background colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundSecondary = Color(0xFFF9F9F9);
  static const Color cardBackground = Color(0xFFFAFAFA);

  // Text colors
  static const Color text = Color(0xFF000000);
  static const Color textSecondary = Color(0xFF8E8E93);
  static const Color textTertiary = Color(0xFFC7C7CC);

  // Route colors
  static const Color greenRoute = Color(0xFF34C759); // 緑道
  static const Color yellowRoute = Color(0xFFFFCC00); // 標準ルート
  static const Color blueRoute = Color(0xFF5AC8FA); // フラットルート

  // Feature colors
  static const Color trafficSignal = Color(0xFFFF3B30); // 信号
  static const Color park = Color(0xFF30D158); // 公園
  static const Color warning = Color(0xFFFF9500); // 警告

  // UI elements
  static const Color divider = Color(0xFFE5E5EA);
  static const Color shadow = Color(0x1A000000);

  // Disabled state
  static const Color disabled = Color(0xFFD1D1D6);
  static const Color disabledText = Color(0xFF999999);

  // Success/Error
  static const Color success = Color(0xFF34C759);
  static const Color error = Color(0xFFFF3B30);

  AppColors._();
}
