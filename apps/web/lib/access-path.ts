// Set by the middleware on signed-in page requests: a server component cannot
// read its own path, and the access log wants it.
export const ACCESS_PATH_HEADER = "x-access-path";
