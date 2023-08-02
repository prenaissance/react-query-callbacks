micro library to return @tanstack/react-query callbacks

[![codecov](https://codecov.io/gh/prenaissance/react-query-callbacks/branch/master/graph/badge.svg)](https://codecov.io/gh/prenaissance/react-query-callbacks)
![CI workflow](https://github.com/prenaissance/react-query-callbacks/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/react-query-callbacks?color=green&label=npm)

## Available callbacks

- `onSettled(data, error)` - called when the query status changes to `success` or `error`
- `onSuccess(data)` - called when the query status changes to `success`
- `onError(error)` - called when the query status changes to `error`
- `onDataChanged(data)` - called every time the data is fetched and is defined

## Install

```bash
npm install "react-query-callbacks"
```

## Usage

```tsx
import { useQuery } from "@tanstack/react-query";
import { useQueryCallbacks } from "react-query-callbacks";
import User from "./your-components/User";
import { getUsers } from "./your-services/users";

const Users = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  useQueryCallbacks({
    query: usersQuery,
    onError: (error) => {
      console.error(`Could not fetch users: ${error}`);
    },
  });

  return (
    <>
      {(usersQuery.data ?? []).map((user) => (
        <User key={user.id} user={user} />
      ))}
    </>
  );
};

export default Users;
```
