import { colors } from '@/src/theme/colors';

export function scrollContentStyle(empty: boolean) {
    return {
        flexGrow: 1,
        paddingTop: 16,
        backgroundColor: colors.neutralLight.light,
        justifyContent: (empty ? 'center' : 'flex-start') as 'center' | 'flex-start',
    };
}

export const textEmptyTitle = {
    color: colors.neutralDark.darkest,
    maxWidth: 240,
    textAlign: 'center' as const,
};

export const textEmptySub = {
    color: colors.neutralDark.light,
    maxWidth: 240,
    textAlign: 'center' as const,
};

export const heroWrap = {
    paddingHorizontal: 16,
};

export const praiseText = {
    color: colors.neutralDark.darkest,
    textAlign: 'center' as const,
    paddingVertical: 24,
};

export const listPad = { paddingHorizontal: 8 };
