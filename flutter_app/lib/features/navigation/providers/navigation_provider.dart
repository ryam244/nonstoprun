import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../../core/services/location_service.dart';
import '../../course/domain/entities/course.dart';
import '../domain/entities/navigation_state.dart';
import '../domain/usecases/navigation_service.dart';

/// ナビゲーションプロバイダー
final navigationProvider = StateNotifierProvider<NavigationNotifier, NavigationState>((ref) {
  return NavigationNotifier();
});

/// ナビゲーション状態管理
class NavigationNotifier extends StateNotifier<NavigationState> {
  NavigationNotifier() : super(const NavigationState());

  final NavigationService _navigationService = NavigationService();
  final LocationService _locationService = LocationService();
  StreamSubscription<LatLng>? _locationSubscription;
  Timer? _timer;

  /// ナビゲーションを準備
  void prepare(Course course) {
    state = NavigationState(
      status: NavigationStatus.ready,
      course: course,
      distanceRemaining: course.distance,
    );
  }

  /// ナビゲーション開始
  Future<void> start() async {
    if (state.status != NavigationStatus.ready && state.status != NavigationStatus.paused) {
      return;
    }

    final course = state.course;
    if (course == null) return;

    // 現在地を取得
    final currentLocation = await _locationService.getCurrentLocation();
    if (currentLocation == null) return;

    // 状態を更新
    state = state.copyWith(
      status: NavigationStatus.running,
      currentLocation: currentLocation,
      startTime: state.startTime ?? DateTime.now(),
      traveledPath: [currentLocation],
    );

    // 位置情報の継続的な監視を開始
    _startLocationTracking();
    _startTimer();
  }

  /// 位置情報の継続的な監視
  void _startLocationTracking() {
    _locationSubscription?.cancel();
    _locationSubscription = _locationService.getPositionStream().listen((location) {
      _updateLocation(location);
    });
  }

  /// タイマー開始（1秒ごとに経過時間を更新）
  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (state.status == NavigationStatus.running) {
        _updateElapsedTime();
      }
    });
  }

  /// 位置情報を更新
  void _updateLocation(LatLng newLocation) {
    if (state.status != NavigationStatus.running || state.course == null) {
      return;
    }

    final course = state.course!;
    final traveledPath = [...state.traveledPath, newLocation];

    // 走行距離を計算（実際の軌跡から）
    final distanceTraveled = _navigationService.calculateActualDistance(traveledPath);

    // 残り距離を計算
    final distanceRemaining = _navigationService.calculateDistanceRemaining(
      newLocation,
      course.coordinates,
    );

    // ルート逸脱判定
    final isOffRoute = _navigationService.isOffRoute(newLocation, course.coordinates);

    // 現在のペースを計算
    final currentPace = _navigationService.calculateCurrentPace(
      traveledPath: traveledPath,
      elapsedTime: state.elapsedTime,
    );

    // コース完了判定
    final isCompleted = _navigationService.isCompleted(
      currentLocation: newLocation,
      course: course,
      distanceTraveled: distanceTraveled,
    );

    state = state.copyWith(
      currentLocation: newLocation,
      distanceTraveled: distanceTraveled,
      distanceRemaining: distanceRemaining,
      isOffRoute: isOffRoute,
      currentPace: currentPace,
      traveledPath: traveledPath,
    );

    // 完了した場合
    if (isCompleted) {
      complete();
    }
  }

  /// 経過時間を更新
  void _updateElapsedTime() {
    if (state.startTime == null) return;

    final now = DateTime.now();
    final elapsed = now.difference(state.startTime!);

    state = state.copyWith(elapsedTime: elapsed);
  }

  /// 一時停止
  void pause() {
    if (state.status != NavigationStatus.running) return;

    _locationSubscription?.cancel();
    _timer?.cancel();

    state = state.copyWith(
      status: NavigationStatus.paused,
      pauseTime: DateTime.now(),
    );
  }

  /// 再開
  Future<void> resume() async {
    if (state.status != NavigationStatus.paused) return;

    state = state.copyWith(
      status: NavigationStatus.running,
      pauseTime: null,
    );

    _startLocationTracking();
    _startTimer();
  }

  /// 完了
  void complete() {
    _locationSubscription?.cancel();
    _timer?.cancel();

    state = state.copyWith(status: NavigationStatus.completed);
  }

  /// 停止してリセット
  void stop() {
    _locationSubscription?.cancel();
    _timer?.cancel();

    state = const NavigationState();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    _timer?.cancel();
    super.dispose();
  }
}
