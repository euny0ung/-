import Report from './components/Admin/Report';
import Alarm from './components/user/Alarm';
import MainPage from './pages/MainPage';
import LandingPage from './pages/LandingPage';
import Login from './components/login/Login';
import Header from './components/Header';
import ChangeInfo from 'components/user/ChangeInfo';
import ErrorPage from 'pages/ErrorPage';
import FindUser from 'components/user/FindUser';
import KakaoLogin from './components/login/KakaoLogin';
import List from 'components/reusable/List';
import StarDetail from 'components/star/StarDetail';
import StarRegist from 'components/star/StarRegist';
import StarFavorList from 'components/star/StarFavorList';
import FollowList from 'components/user/FollowList';
import Settings from 'components/user/Settings';
// StarTagSearch, Settings 추가
import { Link } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

function App() {
    return (
        <div className="App">
            <Header />
            <Routes>
                {/* url이 3000이 아니라서 클라이언트쪽에서 특정 페이지로 이동하게 만들지 못함 */}
                <Route
                    path="/member/join/kakao"
                    element={<KakaoLogin />}
                ></Route>
                <Route exact path="/landing/login" element={<Login />}></Route>
                <Route path="/space/:user_id" element={<MainPage />}>
                    <Route path="editInfo" element={<ChangeInfo />} />
                    <Route path="starMine" element={<List />} />
                    <Route path="starFavor" element={<StarFavorList />} />
                    <Route path="follow" element={<FollowList />} />
                    <Route path="findUser" element={<FindUser />} />
                    <Route path="alarm" element={<Alarm />} />
                    <Route path="tagSearch" element={<StarTagSearch />} />
                    <Route path="settings" element={<Settings />}></Route>
                    <Route path="*" element={<ErrorPage />} />
                </Route>
            </Routes>
            <Link to="/space/1">
                <button>1번 유저의 페이지로 이동</button>
            </Link>
        </div>
    );
}
export default App;
