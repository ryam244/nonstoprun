import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/location_provider.dart';
import '../providers/distance_provider.dart';

/// トップ画面: 距離入力とコース検索
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // 位置情報を取得
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(locationProvider.notifier).fetchCurrentLocation();
    });
  }

  @override
  Widget build(BuildContext context) {
    final distance = ref.watch(distanceProvider);
    final locationState = ref.watch(locationProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // ヘッダー
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacingLg),
              child: Column(
                children: [
                  // タイトルと設定ボタン
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const SizedBox(width: 40), // 左側のスペース（バランス用）
                      Expanded(
                        child: Text(
                          'Non-Stop Run',
                          style: AppTypography.title1.copyWith(
                            color: AppColors.primary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      // 設定ボタン
                      IconButton(
                        icon: const Icon(Icons.settings),
                        color: AppColors.primary,
                        onPressed: () => context.push('/settings'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacingSm),
                  Text(
                    '信号のないコースを見つけよう',
                    style: AppTypography.subheadline.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  // 位置情報の状態表示
                  if (locationState.isLoading)
                    Padding(
                      padding: const EdgeInsets.only(top: AppTheme.spacingSm),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          const SizedBox(width: AppTheme.spacingSm),
                          Text(
                            '位置情報を取得中...',
                            style: AppTypography.caption1,
                          ),
                        ],
                      ),
                    ),
                  if (locationState.error != null && !locationState.isLoading)
                    Padding(
                      padding: const EdgeInsets.only(top: AppTheme.spacingSm),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.location_off,
                            size: 16,
                            color: AppColors.warning,
                          ),
                          const SizedBox(width: AppTheme.spacingXs),
                          Flexible(
                            child: Text(
                              locationState.error!,
                              style: AppTypography.caption1.copyWith(
                                color: AppColors.warning,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            const Spacer(),

            // 距離入力セクション
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLg),
              child: Column(
                children: [
                  Text(
                    '走りたい距離を選択',
                    style: AppTypography.headline,
                  ),
                  const SizedBox(height: AppTheme.spacingMd),

                  // 距離表示
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacingXl,
                      vertical: AppTheme.spacingLg,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.cardBackground,
                      borderRadius: BorderRadius.circular(AppTheme.radiusXl),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.shadow,
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text(
                          distance.toStringAsFixed(1),
                          style: AppTypography.distanceDisplay.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          'km',
                          style: AppTypography.title2.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppTheme.spacingXl),

                  // 距離選択ホイール
                  SizedBox(
                    height: 200,
                    child: CupertinoPicker(
                      scrollController: FixedExtentScrollController(
                        initialItem: (distance * 2 - 2).toInt(),
                      ),
                      itemExtent: 50,
                      diameterRatio: 1.5,
                      useMagnifier: true,
                      magnification: 1.2,
                      onSelectedItemChanged: (index) {
                        // 0.5km刻みで1.0km〜42.0kmまで
                        final newDistance = (index / 2) + 1.0;
                        ref.read(distanceProvider.notifier).setDistance(newDistance);
                      },
                      children: List.generate(
                        83, // (42.0 - 1.0) * 2 + 1 = 83
                        (index) {
                          final km = (index / 2) + 1.0;
                          return Center(
                            child: Text(
                              '${km.toStringAsFixed(1)} km',
                              style: AppTypography.title3,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // コース検索ボタン
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacingLg),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    context.push(
                      '/course',
                      extra: {'distance': distance},
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppTheme.spacingMd + 2,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.search, size: AppTheme.iconSizeMd),
                      const SizedBox(width: AppTheme.spacingSm),
                      Text(
                        'ノンストップコースを探す',
                        style: AppTypography.button,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: AppTheme.spacingMd),
          ],
        ),
      ),
    );
  }
}
