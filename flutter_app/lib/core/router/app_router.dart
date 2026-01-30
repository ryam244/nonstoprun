import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/course/presentation/course_screen.dart';

/// アプリケーション全体のルーティング設定
class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/course',
        name: 'course',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return CourseScreen(
            distance: extra?['distance'] as double? ?? 5.0,
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(
        title: const Text('エラー'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text('ページが見つかりません'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('ホームに戻る'),
            ),
          ],
        ),
      ),
    ),
  );

  AppRouter._();
}
