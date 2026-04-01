import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, Platform } from 'react-native';
import {Feather, Ionicons} from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

export type TabType = 'play' | 'history' | 'results';

interface GameBottomTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const GameBottomTabs = ({ activeTab, onTabChange }: GameBottomTabsProps) => {
    const { t } = useTranslation();

    return (
        <Box
            row
            style={{
                backgroundColor: colors.neutralLight.lightest,
                paddingBottom: Platform.OS === 'ios' ? 20 : 0
            }}
            px={4}
            mt={4}
            mb={8}
            gap={2}
        >
            <TabButton
                title={t('player.tabs.play')}
                icon="play"
                isActive={activeTab === 'play'}
                onPress={() => onTabChange('play')}
            />
            <TabButton
                title={t('player.tabs.history')}
                icon="compass"
                isActive={activeTab === 'history'}
                onPress={() => onTabChange('history')}
            />
            <TabButton
                title={t('player.tabs.results')}
                icon="star"
                isActive={activeTab === 'results'}
                onPress={() => onTabChange('results')}
            />
        </Box>
    );
};

const TabButton = ({ title, icon, isActive, onPress }: any) => (
    <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Box
            align="center"
            style={{
                gap: isActive ? 9 : 8, minHeight: 42
            }}
        >
            <Box width={20} height={20} align="center" justify="center">
                <Ionicons name={icon} size={20} color={isActive ? colors.highlight.darkest : colors.neutralLight.dark} style={{
                    lineHeight: 20,
                    textAlign: 'center'
                }}/>
            </Box>
            <Text
                variant={isActive ? "actionS" : "bodyXS"}
                style={{
                    color: isActive ? colors.neutralDark.darkest : colors.neutralDark.light,
                }}
            >
                {title}
            </Text>
        </Box>
    </TouchableOpacity>
);