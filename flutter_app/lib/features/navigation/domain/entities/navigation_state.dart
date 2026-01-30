import 'package:latlong2/latlong.dart';
import '../../../course/domain/entities/course.dart';

/// ナビゲーションの状態
enum NavigationStatus {
  idle, // 待機中
  ready, // 準備完了
  running, // 走行中
  paused, // 一時停止
  completed, // 完了
}

/// ナビゲーション状態
class NavigationState {
  final NavigationStatus status;
  final Course? course;
  final LatLng? currentLocation;
  final double distanceTraveled; // 走行距離（km）
  final double distanceRemaining; // 残り距離（km）
  final Duration elapsedTime; // 経過時間
  final double currentPace; // 現在のペース（分/km）
  final bool isOffRoute; // ルートから外れているか
  final List<LatLng> traveledPath; // 実際に走った軌跡
  final DateTime? startTime;
  final DateTime? pauseTime;

  const NavigationState({
    this.status = NavigationStatus.idle,
    this.course,
    this.currentLocation,
    this.distanceTraveled = 0.0,
    this.distanceRemaining = 0.0,
    this.elapsedTime = Duration.zero,
    this.currentPace = 0.0,
    this.isOffRoute = false,
    this.traveledPath = const [],
    this.startTime,
    this.pauseTime,
  });

  NavigationState copyWith({
    NavigationStatus? status,
    Course? course,
    LatLng? currentLocation,
    double? distanceTraveled,
    double? distanceRemaining,
    Duration? elapsedTime,
    double? currentPace,
    bool? isOffRoute,
    List<LatLng>? traveledPath,
    DateTime? startTime,
    DateTime? pauseTime,
  }) {
    return NavigationState(
      status: status ?? this.status,
      course: course ?? this.course,
      currentLocation: currentLocation ?? this.currentLocation,
      distanceTraveled: distanceTraveled ?? this.distanceTraveled,
      distanceRemaining: distanceRemaining ?? this.distanceRemaining,
      elapsedTime: elapsedTime ?? this.elapsedTime,
      currentPace: currentPace ?? this.currentPace,
      isOffRoute: isOffRoute ?? this.isOffRoute,
      traveledPath: traveledPath ?? this.traveledPath,
      startTime: startTime ?? this.startTime,
      pauseTime: pauseTime ?? this.pauseTime,
    );
  }

  /// 平均ペースを取得（分/km）
  double get averagePace {
    if (distanceTraveled <= 0) return 0.0;
    return elapsedTime.inSeconds / 60.0 / distanceTraveled;
  }

  /// 推定残り時間を取得
  Duration get estimatedTimeRemaining {
    if (currentPace <= 0 || distanceRemaining <= 0) return Duration.zero;
    return Duration(seconds: (currentPace * 60 * distanceRemaining).round());
  }
}
