import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthShell } from "@/src/ui/AuthShell";
import { Text } from "@/src/ui/Text";
import { Button } from "@/src/ui/Button";
import { Box } from "@/src/ui/Box";
import { colors } from "@/src/theme/colors";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        void mixpanel.track("Host Forgot Password Viewed");
    }, []);

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 24 }}>
                <Box gap={2}>
                    <Text variant="h3">{t("hostForgotPassword.screenTitle")}</Text>
                </Box>

                <Text variant="bodyM" style={{ color: colors.neutralDark.dark, lineHeight: 22 }}>
                    {t("hostForgotPassword.body")}
                </Text>

                <Button
                    title={t("hostForgotPassword.backToLogin")}
                    variant="primary"
                    onPress={() => {
                        void mixpanel.track("Host Forgot Password Back To Login Clicked");
                        router.replace("/login");
                    }}
                />
            </View>
        </AuthShell>
    );
}
