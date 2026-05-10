/**
 * FileUploader
 *
 * Reusable file/photo upload component backed by Supabase Storage.
 * Uses expo-image-picker for photos and expo-document-picker for files.
 *
 * Props:
 *   bucket      — Supabase storage bucket name (e.g. "violation-evidence")
 *   folder      — path prefix inside the bucket (e.g. the violation ID)
 *   onUploaded  — called with the public URL after each successful upload
 *   maxFiles    — max number of files allowed (default: 5)
 */

import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  uri: string;       // public URL
  name: string;
  type: "image" | "document";
}

interface Props {
  bucket: string;
  folder: string;
  onUploaded?: (url: string, name: string) => void;
  maxFiles?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileIcon(name: string): keyof typeof Ionicons.glyphMap {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? "")) return "image-outline";
  if (ext === "pdf") return "document-text-outline";
  return "document-outline";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FileUploader({ bucket, folder, onUploaded, maxFiles = 5 }: Props) {
  const [files,     setFiles]     = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const upload = async (uri: string, name: string, mimeType: string, base64?: string | null) => {
    setUploading(true);
    try {
      let fileData: Uint8Array;

      if (base64 && base64.length > 0) {
        // Use provided base64 data (from image picker)
        const binaryString = atob(base64);
        fileData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          fileData[i] = binaryString.charCodeAt(i);
        }
        
        if (fileData.byteLength === 0) {
          throw new Error("Base64 data resulted in empty file");
        }
      } else {
        // Fallback: read from file system
        const readBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        if (!readBase64 || readBase64.length === 0) {
          throw new Error("Filesystem read returned empty result");
        }
        const binaryString = atob(readBase64);
        fileData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          fileData[i] = binaryString.charCodeAt(i);
        }
        
        if (fileData.byteLength === 0) {
          throw new Error("Filesystem data resulted in empty file");
        }
      }

      const path = `${folder}/${Date.now()}_${name}`;


      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, fileData, { contentType: mimeType, upsert: false });

      if (error) throw error;
      

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;
      const isImage = mimeType.startsWith("image/");


      setFiles((prev) => [
        ...prev,
        { uri: publicUrl, name, type: isImage ? "image" : "document" },
      ]);

      onUploaded?.(publicUrl, name);
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message ?? "Could not upload file.");
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
      await upload(asset.uri, name, asset.mimeType ?? "image/jpeg", asset.base64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = `photo_${Date.now()}.jpg`;
      await upload(asset.uri, name, "image/jpeg", asset.base64);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        Alert.alert("File Too Large", "Maximum file size is 10MB.");
        return;
      }
      await upload(asset.uri, asset.name, asset.mimeType ?? "application/octet-stream");
    }
  };

  const showPicker = () => {
    if (files.length >= maxFiles) {
      Alert.alert("Limit Reached", `You can only upload up to ${maxFiles} files.`);
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Take Photo", "Choose from Library", "Upload Document"], cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) takePhoto();
          if (i === 2) pickImage();
          if (i === 3) pickDocument();
        },
      );
    } else {
      Alert.alert("Add Evidence", "Choose source:", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo",            onPress: takePhoto     },
        { text: "Choose from Library",   onPress: pickImage     },
        { text: "Upload Document",       onPress: pickDocument  },
      ]);
    }
  };

  const removeFile = (index: number) => {
    Alert.alert("Remove File", "Remove this file?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setFiles((prev) => prev.filter((_, i) => i !== index)) },
    ]);
  };

  return (
    <View>
      {/* Uploaded file previews */}
      {files.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {files.map((f, i) => (
            <View key={i} style={{ position: "relative" }}>
              {f.type === "image" ? (
                <Image
                  source={{ uri: f.uri }}
                  style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: "#F1F5F9" }}
                />
              ) : (
                <View style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={fileIcon(f.name)} size={24} color="#6366F1" />
                  <Text style={{ fontSize: 8, color: "#94A3B8", marginTop: 4, textAlign: "center", paddingHorizontal: 4 }} numberOfLines={2}>
                    {f.name}
                  </Text>
                </View>
              )}
              {/* Remove button */}
              <TouchableOpacity
                onPress={() => removeFile(i)}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Upload tap area */}
      <TouchableOpacity
        onPress={showPicker}
        disabled={uploading}
        style={{
          backgroundColor: "#F8FAFC",
          borderWidth: 1.5,
          borderColor: "#E2E8F0",
          borderStyle: "dashed",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: uploading ? 20 : 24,
        }}
      >
        {uploading ? (
          <ActivityIndicator color="#6366F1" />
        ) : (
          <>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Ionicons name="cloud-upload-outline" size={22} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 3 }}>
              {files.length === 0 ? "Tap to add photos or files" : "Add more files"}
            </Text>
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
              PDF, JPG or PNG · Max 10MB · {files.length}/{maxFiles}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}