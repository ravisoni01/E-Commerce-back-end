// create and save token and save in the cookie
const jwtToken = (user, statusCode, res) => {

    // create jwt token
    const token = user.getJWTToken()

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    })
}
export default jwtToken