import { colors } from '@/src/theme/colors';

export function scrollContentStyle(empty: boolean, extraBottom: boolean) {
    return {
        flexGrow: 1,
        paddingTop: empty ? 10 : 8,
        backgroundColor: colors.neutralLight.light,
        justifyContent: (empty ? 'center' : 'flex-start') as 'center' | 'flex-start',
        paddingBottom: extraBottom ? 24 : 16,
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
    marginBottom: 20,
};

export const praiseText = {
    color: colors.neutralDark.darkest,
    textAlign: 'center' as const,
};

export const listPad = { paddingHorizontal: 8 };

export const feedbackBtnWrap = {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
};
