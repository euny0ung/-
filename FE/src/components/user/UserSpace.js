import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    useTexture,
} from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import * as THREE from 'three';
import axios from 'axios';
import {
    atom,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
} from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import StarRegist from 'components/star/StarRegist';
import StarDetail from 'components/star/StarDetail';
import { isStarDetailOpenState, isStarModifyOpenState, isStarRegistOpenState } from 'components/atom';
import { position } from '../../data';

// 해당 별자리 내 첫 번째 별 번호, 마지막 별 번호
const starRange = [];
position.forEach((element, index) =>
    starRange.push([element[0][0], element[element.length - 1][0]])
);

// 페이지 내 존재하는 별 개수
const totalStarCount =
    position[position.length - 1][position[position.length - 1].length - 1][0] +
    1;

///////////////////////////////// atoms
// 현재 페이지
const curPageState = atom({
    key: 'curPage',
    default: 0,
});

// 현재 페이지에서 작성된 별 목록
const starsState = atom({
    key: 'stars',
    default: [],
});

// isAddedStar : 등록된 별 체크를 위한 Map
const isAddedStar = new Map();

// 별자리 이어짐 체크
const constellationCheck = (starNum) => {
    let res = true;

    outer: for (let i = 0; i < starRange.length; i++) {
        if (starRange[i][1] >= starNum) {
            for (let j = starRange[i][0]; j <= starRange[i][1]; j++) {
                if (!isAddedStar.has(j)) {
                    res = false;
                    break outer;
                }
            }
            break;
        }
    }

    return res;
};

function Line(props) {
    // console.log("LINE MOUNTED");

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(props.points);

    return (
        <>
            <line geometry={lineGeometry}>
                <lineBasicMaterial
                    attach="material"
                    transparent={props.lineColor}
                    opacity={0}
                />
            </line>
        </>
    );
}

function Sphere(props) {
    // console.log("SPHERE MOUNTED");

    // const texture = useTexture("texture/bakedUniverse.png");
    // console.log(texture);

    const mesh = useRef(null);

    return (
        <mesh ref={mesh} position={props.position}>
            <sphereGeometry args={props.size} />
            <meshStandardMaterial
                color={props.color}
                side={
                    props.type === 'double'
                        ? THREE.DoubleSide
                        : props.type === 'front'
                        ? THREE.FrontSide
                        : THREE.BackSide
                }
            />
        </mesh>
    );
}

function Star(props) {
    // console.log(`STAR ${props.location} MOUNTED`);

    const params = useParams();
    const mesh = useRef(null);
    const stars = useRecoilValue(starsState);

    const setIsStarDetailOpen = useSetRecoilState(isStarDetailOpenState);
    const setIsStarRegistOpen = useSetRecoilState(isStarRegistOpenState);

    // curStarState: 해당 별 객체 정보를 모두 담고 있다.
    const [curStarState, setCurStarState] = useState(null);

    useEffect(() => {
        setCurStarState(isAddedStar.get(props.location));
    }, [stars]);

    const colors = {
        OPEN: 'yellow',
        PARTOPEN: 'red',
    };

    const handleClick = (locationNum) => {
        const starInfo = isAddedStar.get(locationNum);
        if (starInfo) {
            // 별 상세보기 모달 띄우기
            setIsStarDetailOpen([starInfo.boardIndex, params['user_id']]);
        } else {
            // 별 등록 모달 띄우기
            if (params["user_id"] === localStorage.getItem("memberIndex")){
                setIsStarRegistOpen(locationNum);
            }
        }
    };

    return (
        <mesh
            ref={mesh}
            position={props.position}
            onClick={() => {
                handleClick(props.location);
            }}
        >
            <sphereGeometry args={props.size} />
            <meshStandardMaterial
                color={curStarState ? colors[curStarState.boardAccess] : 'grey'}
            />
        </mesh>
    );
}

function GroupStar(props) {
    // console.log(`GROUP-STAR ${props.groupNum} MOUNTED`);

    const stars = useRecoilValue(starsState);
    const [lineState, setLineState] = useState([]);
    const [lineColor, setLineColor] = useState(true);
    const group = useRef(null);

    // // 별자리 생성 체크용 트리
    // const range = starRange[props.groupNum];
    // const size = 1 << (Math.ceil(Math.log(range[1] - range[0] + 1) / Math.log(2)) + 1);
    // const constellationTree = Array(size).fill(true);

    // const initTree = (node, start, end) => {
    //   if (start === end) {
    //     constellationTree[node] = isAddedStar.get(range[0] + start) ? true : false;
    //     return;
    //   }

    //   let mid = Math.floor((start + end) / 2);
    //   initTree(node * 2, start, mid);
    //   initTree(node * 2 + 1, mid + 1, end);
    //   constellationTree[node] = constellationTree[node * 2] && constellationTree[node * 2 + 1];
    // };

    // const updateTree = (node, start, end, idx, val) => {
    //   if (idx < start || end < idx) {
    //     return;
    //   }

    //   if (start === end) {
    //     constellationTree[node] = val;
    //     return;
    //   }

    //   let mid = Math.floor((start + end) / 2);
    //   updateTree(node * 2, start, mid, idx, val);
    //   updateTree(node * 2 + 1, mid + 1, end, idx, val);
    //   constellationTree[node] = constellationTree[node * 2] && constellationTree[node * 2 + 1];
    // };

    // const queryTree = (node, start, end, left, right) => {
    //   if (end < left || right < start) {
    //     return true;
    //   }

    //   if (left <= start && end <= right) {
    //     return constellationTree[node];
    //   }

    //   let mid = Math.floor((start + end) / 2);
    //   let l = queryTree(node * 2, start, mid, left, right);
    //   let r = queryTree(node * 2 + 1, mid + 1, end, left, right);
    //   return l && r;
    // };

    useEffect(() => {
        const lastStarOfThisGroup =
            props.position[props.position.length - 1][0];
        if (constellationCheck(lastStarOfThisGroup)) {
            setLineColor(false);
        }
    }, [stars]);

    useEffect(() => {
        setLineState(
            props.position.map((val) => new THREE.Vector3(...val.slice(1, 4)))
        );
    }, []);

    useFrame((state, delta) => {
        group.current.rotation.y += delta / 220;
    });

    return (
        <>
            <group
                ref={group}
                onPointerOver={() => {
                    console.log(`Over ${props.groupNum}`);
                }}
            >
                {props.position.map((val, index) => (
                    <Star
                        key={index}
                        size={[0.13, 32, 32]}
                        positions={position}
                        position={val.slice(1, 4)}
                        location={val[0]}
                        setLineColor={setLineColor}
                    />
                ))}
                <Line points={lineState} lineColor={lineColor} />
            </group>
        </>
    );
}

function SceneStars() {
    console.log('SCENE-STARS MOUNTED');

    const setStars = useSetRecoilState(starsState);
    const curPage = useRecoilValue(curPageState);

    const params = useParams();
    const userId = params.user_id;
    console.log(userId);
    // 페이지 내 별 정보 불러오기
    useEffect(() => {
        const fetchData = async () => {
            await axios
                .get(`${process.env.REACT_APP_API_URL}/board/star/${userId}`, {
                    header: {
                        token: localStorage.getItem('token') ?? '',
                    },
                    params: {
                        page: curPage ?? 0,
                    },
                })
                .then((response) => {
                    isAddedStar.clear();
                    response.data.BoardListResponseDtoList.forEach((star) =>
                        isAddedStar.set(star.boardLocation, star)
                    );
                    console.log(response.data);
                    setStars(response.data);
                })
                .catch((e) => {
                    console.log(e);
                });
        };
        fetchData();
    }, [curPage]);

    return (
        <>
            {position.map((val, index) => {
                return (
                    <GroupStar key={index} groupNum={index} position={val} />
                );
            })}
        </>
    );
}

function SceneLights() {
    console.log('SCENE-LIGHTS MOUNTED');
    return (
        <>
            {/* 광원 */}
            <directionalLight position={[0, 0, 5]} intensity={2} />
            <ambientLight intensity={2} />

            {/* 중심점 - 추후 삭제 */}
            <Sphere
                size={[0.01, 16, 16]}
                position={[0.5, -7.8, -1]}
                color={'red'}
            />
        </>
    );
}

function SceneEnvironment() {
    // const texture = useLoader(TextureLoader, "texture/bakedUniverse.png");

    return (
        <>
            {/* 우주 배경 */}
            <Sphere
                size={[40, 48, 48, 0, Math.PI * 2, 0, (Math.PI * 2) / 3]}
                position={[0, -4, 0]}
                color={'black'}
                type={'back'}
            />
            {/* <Cube /> */}

            {/* 바닥면 */}
            <Sphere
                size={[2, 48, 48, 0, Math.PI * 2]}
                position={[0, -2.2, 0]}
                color={'orange'}
            />
        </>
    );
}

function StarRegistArea() {
    const isStarRegistOpen = useRecoilValue(isStarRegistOpenState);
    const isStarModifyOpen = useRecoilValue(isStarModifyOpenState);
    
    return (
        <div>
            {
                isStarRegistOpen !== -1 && (
                    <StarRegist type={'regist'} location={isStarRegistOpen} />
                )
            }
            {
                isStarModifyOpen !== -1 && (
                    <StarRegist type={'modify'} preBoard={isStarModifyOpen}/>
                )
            }
        </div>
    );
}

function StarDetailArea() {
    const isStarDetailOpen = useRecoilValue(isStarDetailOpenState);

    return (
        <div>
            {isStarDetailOpen.length !== 0 && (
                <StarDetail
                    starIndex={isStarDetailOpen[0]}
                    userIndex={isStarDetailOpen[1]}
                />
            )}
        </div>
    );
}

function UserSpace() {
    const params = useParams();
    const userId = params.user_id;

    const [loginToken, setLoginToken] = useState(localStorage.getItem('token'));
    const [loginIndex, setLoginIndex] = useState(
        localStorage.getItem('memberIndex')
    );
    const [userName, setUserName] = useState(null);
    const [followState, setFollowState] = useState('');

    const handleFollow = (followState) => {
        const relationData = {
            toMemberIndex: userId,
            fromMemberIndex: loginIndex,
        };
        if (followState === '언팔로우') {
            // 팔로우 취소 api 호출
            axios
                .delete(
                    `${process.env.REACT_APP_API_URL}/follow/following`,
                    {
                        data: relationData,
                    },
                    {
                        headers: {
                            token: loginToken,
                        },
                    }
                )
                .then(() => setFollowState('팔로우'));
        } else if (followState === '팔로우') {
            // 팔로우 api 호출
            axios
                .post(
                    `${process.env.REACT_APP_API_URL}/follow/following`,
                    relationData,
                    {
                        headers: {
                            token: loginToken,
                        },
                    }
                )
                .then(() => setFollowState('언팔로우'));
        }
    };

    useEffect(() => {
        setLoginToken(loginToken);
        setLoginIndex(loginIndex);
    }, [loginToken, loginIndex]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/member/search/list`,
                    {
                        headers: {
                            token: loginToken,
                        },
                    }
                );
                const user = response.data.find(
                    (it) => it.memberIndex == userId
                );

                if (user) setUserName(user.memberNickname);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [userId]);

    // 우주 주인 닉네임과 나의 팔로우 목록을 비교하여 일치하면 팔로우 관계
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/follow/following/${loginIndex}`,
                    {
                        headers: {
                            token: loginToken,
                        },
                    }
                );
                const isFollow = response.data.result.some(
                    (it) => it.memberName === userName
                );

                isFollow
                    ? setFollowState('언팔로우')
                    : setFollowState('팔로우');
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [userName]);

    return (
        <>
            <div
                id="canvas-container"
                style={{ height: '100vh', width: '100vw' }}
            >
                <Canvas>
                    <SceneStars />
                    <SceneLights />
                    <SceneEnvironment />
                    <OrbitControls
                        dampingFactor={0.15}
                        target={[0, 0, 0]}
                        rotateSpeed={-0.15}
                        enableZoom={false}
                    />
                    <PerspectiveCamera
                        makeDefault
                        position={[-0.01, 0, 0.1]}
                        fov={60}
                        zoom={1}
                        aspect={window.innerWidth / window.innerHeight}
                    />
                </Canvas>
            </div>
            {userName && (
                <>
                    <div className="space-name">{userName}님의 우주입니다</div>
                    {userId !== loginIndex && (
                        <button onClick={() => handleFollow(followState)}>
                            {followState}
                        </button>
                    )}
                </>
            )}

            <div className="modal-area">
                <StarRegistArea />
                <StarDetailArea />
            </div>
        </>
    );
}

export {
    isAddedStar,
    isStarRegistOpenState,
    isStarDetailOpenState,
    starsState,
    curPageState,
};
export default UserSpace;
