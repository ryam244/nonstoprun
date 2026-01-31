import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/voice_navigation_provider.dart';

/// 設定画面
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _version = '';
  String _buildNumber = '';

  @override
  void initState() {
    super.initState();
    _loadAppInfo();
  }

  Future<void> _loadAppInfo() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _version = packageInfo.version;
      _buildNumber = packageInfo.buildNumber;
    });
  }

  @override
  Widget build(BuildContext context) {
    final voiceEnabled = ref.watch(voiceNavigationEnabledProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('設定'),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: ListView(
        children: [
          // アプリ設定セクション
          _buildSectionHeader('アプリ設定'),
          _buildSwitchTile(
            icon: Icons.volume_up,
            title: '音声案内',
            subtitle: 'ナビゲーション中の音声ガイド',
            value: voiceEnabled,
            onChanged: (value) {
              ref.read(voiceNavigationEnabledProvider.notifier).state = value;
              ref.read(voiceNavigationServiceProvider).setEnabled(value);
            },
          ),

          const Divider(height: 1),

          // 法的情報セクション（App Store審査必須）
          _buildSectionHeader('法的情報'),
          _buildLinkTile(
            icon: Icons.privacy_tip,
            title: 'プライバシーポリシー',
            subtitle: '個人情報の取り扱いについて',
            onTap: () => _launchURL('https://nonstoprun.example.com/privacy'),
          ),
          _buildLinkTile(
            icon: Icons.description,
            title: '利用規約',
            subtitle: 'サービス利用規約',
            onTap: () => _launchURL('https://nonstoprun.example.com/terms'),
          ),
          _buildLinkTile(
            icon: Icons.gavel,
            title: 'オープンソースライセンス',
            subtitle: '使用しているライブラリのライセンス',
            onTap: () => _showLicensePage(context),
          ),

          const Divider(height: 1),

          // サポートセクション（App Store審査推奨）
          _buildSectionHeader('サポート'),
          _buildLinkTile(
            icon: Icons.help_outline,
            title: 'ヘルプ',
            subtitle: 'よくある質問',
            onTap: () => _launchURL('https://nonstoprun.example.com/help'),
          ),
          _buildLinkTile(
            icon: Icons.email,
            title: 'お問い合わせ',
            subtitle: 'support@nonstoprun.example.com',
            onTap: () => _launchEmail(),
          ),
          _buildLinkTile(
            icon: Icons.star_outline,
            title: 'アプリを評価',
            subtitle: 'App Storeでレビューを書く',
            onTap: () => _launchAppStore(),
          ),

          const Divider(height: 1),

          // アプリ情報セクション
          _buildSectionHeader('アプリ情報'),
          _buildInfoTile(
            icon: Icons.info_outline,
            title: 'バージョン',
            subtitle: 'v$_version (ビルド $_buildNumber)',
          ),
          _buildInfoTile(
            icon: Icons.copyright,
            title: '開発者',
            subtitle: '© 2024 Non-Stop Run',
          ),

          const SizedBox(height: AppTheme.spacingXl),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppTheme.spacingLg,
        AppTheme.spacingLg,
        AppTheme.spacingLg,
        AppTheme.spacingSm,
      ),
      child: Text(
        title,
        style: AppTypography.caption1.copyWith(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title, style: AppTypography.subheadline),
      subtitle: Text(subtitle, style: AppTypography.caption1),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
      tileColor: AppColors.cardBackground,
    );
  }

  Widget _buildLinkTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title, style: AppTypography.subheadline),
      subtitle: Text(subtitle, style: AppTypography.caption1),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      tileColor: AppColors.cardBackground,
      onTap: onTap,
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title, style: AppTypography.subheadline),
      subtitle: Text(subtitle, style: AppTypography.caption1),
      tileColor: AppColors.cardBackground,
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('URLを開けませんでした')),
        );
      }
    }
  }

  Future<void> _launchEmail() async {
    final uri = Uri(
      scheme: 'mailto',
      path: 'support@nonstoprun.example.com',
      query: 'subject=Non-Stop Run お問い合わせ',
    );
    if (!await launchUrl(uri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('メールアプリを開けませんでした')),
        );
      }
    }
  }

  Future<void> _launchAppStore() async {
    // TODO: App StoreのURLに置き換える
    const appId = 'YOUR_APP_ID';
    final uri = Uri.parse('https://apps.apple.com/app/id$appId');
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('App Storeを開けませんでした')),
        );
      }
    }
  }

  void _showLicensePage(BuildContext context) {
    showLicensePage(
      context: context,
      applicationName: 'Non-Stop Run',
      applicationVersion: _version,
      applicationLegalese: '© 2024 Non-Stop Run\n信号のないランニングコースを提案',
    );
  }
}
