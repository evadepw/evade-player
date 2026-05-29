'use client';

/* eslint-disable react-refresh/only-export-components */

import {createContext, useContext, type ReactNode} from 'react';
import type {Locale, LocaleStrings} from '../locales';
import {localeRu, localeEn} from '../locales';

interface LocaleContextValue {
    locale: Locale;
    strings: LocaleStrings;
}

const LOCALE_STRINGS: Record<Locale, LocaleStrings> = {
    ru: localeRu,
    en: localeEn,
};

const LocaleContext = createContext<LocaleContextValue>({locale: 'ru', strings: LOCALE_STRINGS.ru});

export function LocaleProvider({locale, children}: {locale?: Locale; children: ReactNode}): ReactNode {
    const resolved: Locale = locale ?? 'ru';
    return (
        <LocaleContext.Provider value={{locale: resolved, strings: LOCALE_STRINGS[resolved]}}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale(): LocaleContextValue {
    return useContext(LocaleContext);
}

export function useLocaleStrings(): LocaleStrings {
    return useContext(LocaleContext).strings;
}
