import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-XSRF-TOKEN"] = Cookies.get("XSRF-TOKEN");

export default axios;
