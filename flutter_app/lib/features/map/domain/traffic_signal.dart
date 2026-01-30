import 'package:latlong2/latlong.dart';

/// 信号機を表すエンティティ
class TrafficSignal {
  final String id;
  final LatLng location;
  final String? name;
  final Map<String, dynamic>? tags;

  TrafficSignal({
    required this.id,
    required this.location,
    this.name,
    this.tags,
  });

  factory TrafficSignal.fromJson(Map<String, dynamic> json) {
    return TrafficSignal(
      id: json['id'].toString(),
      location: LatLng(
        json['lat'] as double,
        json['lon'] as double,
      ),
      name: json['tags']?['name'] as String?,
      tags: json['tags'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lat': location.latitude,
      'lon': location.longitude,
      'name': name,
      'tags': tags,
    };
  }
}
