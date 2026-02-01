import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/onboarding_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  void _nextPage() {
    if (_currentPage < 3) {
      _pageController.animateToPage(
        _currentPage + 1,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _completeOnboarding() async {
    await ref.read(onboardingServiceProvider).setComplete();
    if (mounted) {
      context.go('/home');
    }
  }

  Future<void> _requestLocationPermission() async {
    final status = await Permission.location.request();
    if (status.isGranted) {
      _nextPage();
    } else if (status.isDenied) {
      // User denied permission, but can still continue
      _nextPage();
    } else if (status.isPermanentlyDenied) {
      // Show dialog to open app settings
      if (mounted) {
        _showSettingsDialog();
      }
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('位置情報の許可が必要です'),
        content: const Text(
          '現在地からのルート検索には位置情報の許可が必要です。\n設定から位置情報を許可してください。',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _nextPage();
            },
            child: const Text('後で'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              openAppSettings();
              _nextPage();
            },
            child: const Text('設定を開く'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            if (_currentPage < 3)
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: _completeOnboarding,
                  child: Text(
                    'スキップ',
                    style: AppTypography.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ),

            // Page view
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                children: [
                  _buildWelcomePage(),
                  _buildFeaturesPage(),
                  _buildLocationPermissionPage(),
                  _buildReadyPage(),
                ],
              ),
            ),

            // Page indicator
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacingLg),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  4,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacingXs,
                    ),
                    width: _currentPage == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == index
                          ? AppColors.primary
                          : AppColors.textTertiary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),

            // Action button
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacingLg),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _currentPage == 2
                      ? _requestLocationPermission
                      : _currentPage == 3
                          ? _completeOnboarding
                          : _nextPage,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppTheme.spacingMd,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    _currentPage == 2
                        ? '位置情報を許可'
                        : _currentPage == 3
                            ? '始める'
                            : '次へ',
                    style: AppTypography.headline.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Page 1: Welcome
  Widget _buildWelcomePage() {
    return Padding(
      padding: const EdgeInsets.all(AppTheme.spacingXl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // App icon placeholder
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              Icons.directions_run,
              size: 64,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppTheme.spacingXl),

          // App name
          Text(
            'Non-Stop Run',
            style: AppTypography.largeTitle.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingMd),

          // Tagline
          Text(
            '信号のないランニングコースを\n見つけよう',
            style: AppTypography.title2.copyWith(
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingLg),

          // Description
          Text(
            '信号待ちなしで快適に走れる\nルートを簡単に検索できます',
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // Page 2: Features
  Widget _buildFeaturesPage() {
    return Padding(
      padding: const EdgeInsets.all(AppTheme.spacingXl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '主な機能',
            style: AppTypography.largeTitle.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppTheme.spacingXl),

          _buildFeatureItem(
            icon: Icons.traffic,
            title: '信号を避けたルート検索',
            description: '信号のない快適なランニングコースを自動生成',
          ),
          const SizedBox(height: AppTheme.spacingLg),

          _buildFeatureItem(
            icon: Icons.show_chart,
            title: '高低差グラフ表示',
            description: 'ルートの高低差を視覚的に確認できます',
          ),
          const SizedBox(height: AppTheme.spacingLg),

          _buildFeatureItem(
            icon: Icons.compare_arrows,
            title: '複数ルートの比較',
            description: '最大3つのルートを同時に比較',
          ),
          const SizedBox(height: AppTheme.spacingLg),

          _buildFeatureItem(
            icon: Icons.volume_up,
            title: '音声ナビゲーション',
            description: 'ランニング中の音声案内に対応',
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 28,
          ),
        ),
        const SizedBox(width: AppTheme.spacingMd),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.headline.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppTheme.spacingXs),
              Text(
                description,
                style: AppTypography.footnote.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Page 3: Location Permission
  Widget _buildLocationPermissionPage() {
    return Padding(
      padding: const EdgeInsets.all(AppTheme.spacingXl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Location icon
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              Icons.location_on,
              size: 64,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppTheme.spacingXl),

          // Title
          Text(
            '位置情報の許可',
            style: AppTypography.largeTitle.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingLg),

          // Description
          Text(
            '現在地からのルート検索には\n位置情報の許可が必要です',
            style: AppTypography.title3.copyWith(
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingXl),

          // Privacy info
          _buildPrivacyItem(
            icon: Icons.check_circle_outline,
            text: '位置情報は外部に送信されません',
          ),
          const SizedBox(height: AppTheme.spacingMd),

          _buildPrivacyItem(
            icon: Icons.check_circle_outline,
            text: 'ルート検索にのみ使用されます',
          ),
          const SizedBox(height: AppTheme.spacingMd),

          _buildPrivacyItem(
            icon: Icons.check_circle_outline,
            text: 'いつでも設定から変更可能です',
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyItem({
    required IconData icon,
    required String text,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppColors.success,
          size: 24,
        ),
        const SizedBox(width: AppTheme.spacingMd),
        Expanded(
          child: Text(
            text,
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  // Page 4: Ready
  Widget _buildReadyPage() {
    return Padding(
      padding: const EdgeInsets.all(AppTheme.spacingXl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Success icon
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              Icons.check_circle,
              size: 64,
              color: AppColors.success,
            ),
          ),
          const SizedBox(height: AppTheme.spacingXl),

          // Title
          Text(
            '準備完了！',
            style: AppTypography.largeTitle.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingLg),

          // Description
          Text(
            'さあ、信号のない快適な\nランニングを始めましょう',
            style: AppTypography.title2.copyWith(
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingXl),

          // Tips
          Container(
            padding: const EdgeInsets.all(AppTheme.spacingMd),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.primary.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ヒント',
                  style: AppTypography.headline.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingSm),
                Text(
                  '• 距離を選択してコースを検索\n'
                  '• 複数のルートを比較できます\n'
                  '• 高低差グラフで難易度を確認\n'
                  '• 音声ナビで快適にラン',
                  style: AppTypography.body.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
