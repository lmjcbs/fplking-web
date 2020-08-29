import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import { createClient, Provider, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import theme from '../theme';
import {
    CurrentUserDocument,
    LoginMutation,
    CurrentUserQuery,
    RegisterMutation,
    LogoutMutation,
} from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        credentials: 'include',
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    logout: (_result, args, cache, info) => {
                        betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
                            cache,
                            { query: CurrentUserDocument },
                            _result,
                            () => {
                                return { currentUser: null };
                            }
                        );
                    },
                    login: (_result, args, cache, info) => {
                        betterUpdateQuery<LoginMutation, CurrentUserQuery>(
                            cache,
                            { query: CurrentUserDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        currentUser: result.login.user,
                                    };
                                }
                            }
                        );
                    },
                    register: (_result, args, cache, info) => {
                        betterUpdateQuery<RegisterMutation, CurrentUserQuery>(
                            cache,
                            { query: CurrentUserDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        currentUser: result.register.user,
                                    };
                                }
                            }
                        );
                    },
                },
            },
        }),
        fetchExchange,
    ],
});

function MyApp({ Component, pageProps }: any) {
    return (
        <Provider value={client}>
            <ThemeProvider theme={theme}>
                {/* <ColorModeProvider> */}
                <CSSReset />
                <Component {...pageProps} />
                {/* </ColorModeProvider> */}
            </ThemeProvider>
        </Provider>
    );
}

export default MyApp;
