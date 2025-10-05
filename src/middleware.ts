import createMiddleware from 'next-intl/middleware';
import { i18n } from './i18n';

export default createMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
});

export const config = {
    matcher: ['/((?!_next|api|favicon.ico|images|.*\\.).*)'],
};
