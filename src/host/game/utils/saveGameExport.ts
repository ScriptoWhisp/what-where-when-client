import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import {
    cacheDirectory,
    writeAsStringAsync,
    EncodingType,
} from "expo-file-system/legacy";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
}

export async function saveGameXlsx(
    gameId: number,
    data: ArrayBuffer,
    options?: {
        cacheUnavailableMessage?: string;
        dialogTitle?: string;
    },
): Promise<void> {
    const filename = `Game_${gameId}.xlsx`;

    if (Platform.OS === "web") {
        if (typeof document === "undefined") return;
        const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    const baseDir = cacheDirectory;
    if (!baseDir) {
        throw new Error(options?.cacheUnavailableMessage ?? "File system cache is unavailable");
    }

    const uri = `${baseDir}${filename}`;
    const base64 = arrayBufferToBase64(data);
    await writeAsStringAsync(uri, base64, {
        encoding: EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: options?.dialogTitle ?? "Export",
        });
    }
}
