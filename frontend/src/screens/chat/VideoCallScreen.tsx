import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { Button } from "@/components/Button";
import { useAppSelector } from "@/hooks/redux";
import {
  useGetOrCreateMeetingMutation,
  useEndMeetingMutation,
} from "@/redux/api/meetingsApi";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ChatStackParamList, "VideoCall">;

// Builds the Daily Prebuilt embed inside the WebView. When a meeting token is
// present we reload the iframe with that token, which authorizes the user even
// for private rooms.
function dailyHtml(roomUrl: string, displayName: string, meetingToken?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #000; }
    #root { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function(d) {
      var w = d.getElementById('root');
      if (window.DailyIframe) {
        window.daily = window.DailyIframe.createFrame(w, {
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: { width: '100%', height: '100%', position: 'relative', border: 0 }
        });
        window.daily.join({
          url: ${JSON.stringify(roomUrl)},
          userName: ${JSON.stringify(displayName)},
          ${meetingToken ? `token: ${JSON.stringify(meetingToken)},` : ""}
        });
      }
    })(document);
  </script>
  <script src="https://unpkg.com/@daily-co/daily-js@0.51.0/dist/daily.js"></script>
</body>
</html>`;
}

const LOADER_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>html,body{margin:0;height:100%;background:#000}</style></head><body></body></html>`;

export function VideoCallScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { userId, userName } = route.params;
  const currentUser = useAppSelector((s) => s.auth.user);
  const meName = currentUser?.name ?? "Guest";

  const [getOrCreate, { isLoading, error }] = useGetOrCreateMeetingMutation();
  const [endMeeting] = useEndMeetingMutation();

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `${userName}'s meeting` });
  }, [navigation, userName]);

  useEffect(() => {
    let active = true;
    getOrCreate(userId)
      .unwrap()
      .then((meeting) => {
        if (!active) return;
        setRoomUrl(meeting.roomUrl);
        setToken(meeting.dailyToken);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [getOrCreate, userId]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    if (e.nativeEvent.data === "joined") setJoined(true);
  }, []);

  const leave = useCallback(() => {
    endMeeting(userId).catch(() => {});
    navigation.goBack();
  }, [endMeeting, userId, navigation]);

  // Once we have the token (fetched with the room), hand it to the iframe by
  // reloading the WebView with the full HTML populated.
  const html = token !== undefined ? dailyHtml(roomUrl ?? "", meName, token || undefined) : LOADER_HTML;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {!roomUrl || token === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>
            Preparing your meeting…
          </Text>
        </View>
      ) : loadFailed ? (
        <View style={styles.center}>
          <Feather name="video-off" size={40} color={colors.textMuted} />
          <Text style={[typography.h4, { color: colors.text, marginTop: spacing.md }]}>
            Could not start the meeting
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, textAlign: "center", marginTop: spacing.xs }]}>
            {error && "data" in error
              ? (error.data as { message?: string })?.message
              : "Please check your connection and try again."}
          </Text>
          <Button label="Go back" variant="ghost" onPress={leave} style={{ marginTop: spacing.lg }} />
        </View>
      ) : roomUrl ? (
        <> 
          <WebView
            source={{ html }}
            style={styles.flex}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onMessage={onMessage}
            onError={() => setLoadFailed(true)}
            onHttpError={() => setLoadFailed(true)}
            originWhitelist={["*"]}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          />
          {!joined ? (
            <View style={styles.topBar}>
              <Text style={[typography.caption, { color: "#FFFFFF" }]}>Connecting…</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {roomUrl ? (
        <View style={[styles.controls, Platform.OS === "ios" ? styles.controlsIos : null]}>
          <Button
            label="Leave"
            variant="outline"
            onPress={leave}
            style={{ minWidth: 160, backgroundColor: colors.danger, borderColor: "transparent" }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  controlsIos: {
    bottom: spacing.xxl,
  },
});
