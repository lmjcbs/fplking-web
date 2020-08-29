import React from 'react';
import { Flex, Box, Link, Button } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useCurrentUserQuery, useLogoutMutation } from '../generated/graphql';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useCurrentUserQuery();
    let body = null;
    console.log(data);
    if (!data?.currentUser) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link>Register</Link>
                </NextLink>
            </>
        );
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.currentUser.username}</Box>
                <Button
                    onClick={() => {
                        logout();
                    }}
                    isLoading={logoutFetching}
                    variant='link'
                    color='black'
                >
                    Logout
                </Button>
            </Flex>
        );
    }
    return (
        <Flex bg='grey' p={4}>
            <Box ml={'auto'}>{body}</Box>
        </Flex>
    );
};
