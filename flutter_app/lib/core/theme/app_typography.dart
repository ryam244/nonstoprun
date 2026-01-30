import 'package:flutter/material.dart';
import 'app_colors.dart';

/// アプリ全体で使用するタイポグラフィ
/// Apple SF Pro相当のスタイルを再現
class AppTypography {
  // Large Title (iOS style)
  static const TextStyle largeTitle = TextStyle(
    fontSize: 34,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.37,
    color: AppColors.text,
    height: 1.2,
  );

  // Title 1
  static const TextStyle title1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.36,
    color: AppColors.text,
    height: 1.2,
  );

  // Title 2
  static const TextStyle title2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.35,
    color: AppColors.text,
    height: 1.3,
  );

  // Title 3
  static const TextStyle title3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.38,
    color: AppColors.text,
    height: 1.3,
  );

  // Headline
  static const TextStyle headline = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.41,
    color: AppColors.text,
    height: 1.35,
  );

  // Body
  static const TextStyle body = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.41,
    color: AppColors.text,
    height: 1.35,
  );

  // Body 2
  static const TextStyle body2 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.32,
    color: AppColors.text,
    height: 1.4,
  );

  // Callout
  static const TextStyle callout = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.32,
    color: AppColors.text,
    height: 1.35,
  );

  // Subheadline
  static const TextStyle subheadline = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.24,
    color: AppColors.text,
    height: 1.35,
  );

  // Footnote
  static const TextStyle footnote = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.08,
    color: AppColors.textSecondary,
    height: 1.35,
  );

  // Caption 1
  static const TextStyle caption1 = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    color: AppColors.textSecondary,
    height: 1.35,
  );

  // Caption 2
  static const TextStyle caption2 = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.07,
    color: AppColors.textSecondary,
    height: 1.35,
  );

  // Button text
  static const TextStyle button = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.41,
    color: Colors.white,
    height: 1.2,
  );

  // 距離表示用の大きな数字
  static const TextStyle distanceDisplay = TextStyle(
    fontSize: 48,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
    color: AppColors.text,
    height: 1.1,
  );

  // 統計情報用の数字
  static const TextStyle statisticNumber = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.36,
    color: AppColors.text,
    height: 1.2,
  );

  AppTypography._();
}
