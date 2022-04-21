import React, { FC, ReactElement } from 'react';
import './index.css';
import { useQuery } from 'react-query';

type GithubUser = {
  login: string;
  id: number;
  avatar_url: string;
};

function assertIsGithubUser(user: any): asserts user is GithubUser {
  if (!("login" in user)) {
    throw new Error("Not user");
  }
}

const fetchUser = async (username: string) => {
  // Option 1:
  // return fetch(`https://api.github.com/users/${username}`)
  //   .then((res) => res.json());

  // Option 2:
  // See https://www.carlrippon.com/getting-started-with-react-query-and-typescript/
  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    throw new Error("Problem fetching data");
  }
  const user = await response.json();
  assertIsGithubUser(user);
  return user;
}

interface GithubUserProps {
  username: string
}

const UserPanel: FC<GithubUserProps> = ({ username }): ReactElement => {

  // The `useQuery` hook performs the data fetching, caches the results, and
  // provides us with the state of the query.
  const {isLoading, isError, data: user, error } = useQuery<GithubUser, Error>(
    [username],
    () => fetchUser(username)
  )

  if (isLoading) return <p>Loading...</p>;

  if (isError) return <p>{error.message}</p>;

  return user ? (
    <>
      <h1>Hello { user.login }</h1>
      <pre>
        {JSON.stringify(user, null, 2)}
      </pre>
    </>
  ): <React.Fragment />;

}

function Demo1() {
  return (
    <div className="demo-1">
      <UserPanel username="sydney-o9" />
    </div>
  );
}

export default Demo1;