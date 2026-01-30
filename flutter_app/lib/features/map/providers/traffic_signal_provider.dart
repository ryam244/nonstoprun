import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../data/overpass_api_service.dart';
import '../domain/traffic_signal.dart';

/// OverpassApiServiceのProvider
final overpassApiServiceProvider = Provider<OverpassApiService>((ref) {
  return OverpassApiService();
});

/// 信号データの状態
class TrafficSignalState {
  final List<TrafficSignal> signals;
  final bool isLoading;
  final String? error;

  TrafficSignalState({
    this.signals = const [],
    this.isLoading = false,
    this.error,
  });

  TrafficSignalState copyWith({
    List<TrafficSignal>? signals,
    bool? isLoading,
    String? error,
  }) {
    return TrafficSignalState(
      signals: signals ?? this.signals,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 信号データを管理するNotifier
class TrafficSignalNotifier extends StateNotifier<TrafficSignalState> {
  final OverpassApiService _apiService;

  TrafficSignalNotifier(this._apiService) : super(TrafficSignalState());

  /// 指定位置周辺の信号データを取得
  Future<void> fetchTrafficSignals({
    required LatLng center,
    double radiusKm = 5.0,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final signals = await _apiService.getTrafficSignals(
        center: center,
        radiusKm: radiusKm,
      );

      state = TrafficSignalState(
        signals: signals,
        isLoading: false,
      );
    } catch (e) {
      state = TrafficSignalState(
        signals: [],
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// 矩形範囲内の信号データを取得
  Future<void> fetchTrafficSignalsInBounds({
    required LatLng southwest,
    required LatLng northeast,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final signals = await _apiService.getTrafficSignalsInBounds(
        southwest: southwest,
        northeast: northeast,
      );

      state = TrafficSignalState(
        signals: signals,
        isLoading: false,
      );
    } catch (e) {
      state = TrafficSignalState(
        signals: [],
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// データをクリア
  void clear() {
    state = TrafficSignalState();
  }
}

/// 信号データのProvider
final trafficSignalProvider =
    StateNotifierProvider<TrafficSignalNotifier, TrafficSignalState>((ref) {
  final apiService = ref.watch(overpassApiServiceProvider);
  return TrafficSignalNotifier(apiService);
});
