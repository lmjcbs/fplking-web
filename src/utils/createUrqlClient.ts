import { dedupExchange, fetchExchange, ssrExchange } from 'urql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
    LogoutMutation,
    CurrentUserQuery,
    CurrentUserDocument,
    LoginMutation,
    RegisterMutation,
} from '../generated/graphql';

export const createUrqlClient = (srrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        credentials: 'include' as const,
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
        ssrExchange,
        fetchExchange,
    ],
});
