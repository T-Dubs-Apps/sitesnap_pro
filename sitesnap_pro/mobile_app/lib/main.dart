import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  // IMPORTANT: Run 'firebase deploy' first to get your specific URL, then paste it here.
  // Example: https://generateestimate-k4lx7s-uc.a.run.app
  static const String _baseUrl = "PASTE_YOUR_CLOUD_FUNCTION_URL_HERE";

  Future<Map<String, dynamic>> getEstimate(File imageFile, String userNotes) async {
    try {
      List<int> imageBytes = await imageFile.readAsBytes();
      String base64Image = base64Encode(imageBytes);

      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "image": base64Image,
          "notes": userNotes,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception("Server Error: ${response.body}");
      }
    } catch (e) {
      throw Exception("Connection Failed: $e");
    }
  }
}