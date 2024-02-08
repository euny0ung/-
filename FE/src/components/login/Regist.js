import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useLocation } from 'react-router';

export default function Regist() {
  const [formOpen, setFormOpen] = useState(false);
  const kakao_join_uri = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_JOIN_REDIRECT_URI}&response_type=code`; 
  const [data,setData] = useState();

  const location = useLocation();
  const { social_id, social_platform } = location.state || {}; // state가 undefined인 경우를 대비한 기본값 설정

  console.log("아이디",social_id, "플래폼",social_platform); // 전달받은 데이터 사용

  useEffect(() =>{
   // 리스너 설치해서 인증성공시, 동작하도록해야할까..
  },[data])

  return (
    <div className="Regist">
      {!formOpen &&
        <div className="modal">
          <button onClick={() => setFormOpen(true)}>일반회원가입</button>
          <button onClick={() => {window.location.assign(kakao_join_uri)}}>카카오</button>
          <a>네이버</a>
          <a>구글</a> 
          <a>깃헙</a>
        </div>
      }
      {formOpen && <RegistForm social_id={social_id} social_platform={social_platform}/>} 
    </div>
  )
}
//  처음들어왔을때, 모달창을 통해서 일반과 소셜중 선택 가능하게해야한다. = <Regist/>는 모달창
//  소셜 회원가입을 선택시, 모달창이 하나더 뜨면서 선택한 소셜로그인 인증을 진행 = <Regist/>에서 모달창으로 띄운다.
//  소셜인증이 성공해서 데이터를 받았거나, 일반회원가입 버튼을 눌렀을때, RegistForm이 교체로 렌더링 되면서 자연스럽게 모달창이 길어진다.
//  소셜인증을 했다면, 필요한 데이터들은 미리 채워져서 RegistForm에서 수정이 비활성화 되게끔해야한다. 
//  이후에 회원가입버튼 누를시, 그사람의 회원가입 플랫폼(origin/ kakao/ naver/google/github)을 스트링으로 보내주어야함.
          

 function RegistForm({ social_id: social_id, social_platform: social_platform }) {
 // 초기값 - 아이디, 닉네임, 비밀번호, 비밀번호확인, 이메일, 생년월일
 const id = useRef("");
 const name = useRef("");
 const nickName = useRef("");
 const password = useRef("");
 const passwordConfirm = useRef("");
 const email = useRef("");
 const authCode = useRef("");
 const birth = useRef("");

 // 오류메세지 상태 저장
 const [idMessage, setIdMessage] = useState("");
 const [nameMessage, setNameMessage] = useState("");
 const [nickNameMessage, setNickNameMessage] = useState("");
 const [passwordMessage, setPasswordMessage] = useState("");
 const [passwordConfirmMessage, setPasswordConfirmMessage] = useState("");
 const [emailMessage, setEmailMessage] = useState("");
 const [authMessage, setAuthMessage] = useState("");
 const [birthMessage, setBirthMessage] = useState("");

 // 유효성 검사
 const [isId, setIsId] = useState(false);
 const [isname, setIsName] = useState(false);
 const [isNickName, setIsNickName] = useState(false);
 const [isPassword, setIsPassword] = useState(false);
 const [isPasswordConfirm, setIsPasswordConfirm] = useState(false);
 const [isEmail, setIsEmail] = useState(false);
 const [isAuthCode, setIsAuthCode] = useState(false);
 const [isBirth, setIsBirth] = useState(false);
 const [openAuthFoam, setOpenAuthFoam] = useState(false);
 
 // 인증코드

 const [AUTH_CODE, setAUTH_CODE] = useState("");

 const onChangeId = () => {
   const idRegExp = /^[a-z0-9]{4,20}$/;
   if (!idRegExp.test(id.current.value)) {
     setIdMessage("4-15사이 대소문자 또는 숫자만 입력해 주세요!");
     setIsId(false);
    } else {
      // 아이디 중복체크
      axios.get(`${process.env.REACT_APP_API_URL}/member/dup-check/id?id=${id.current.value}`)
      .then((response) => {
        setIdMessage(response.data.message);
        if(response.data.message === "사용 가능한 아이디입니다.")setIsId(true)
        else setIsId(false);
    })
    }
 };

 const onChangeName = () => {
  const nameRegExp = /^[가-힣a-zA-Z]{2,20}$/;
   if (!nameRegExp.test(name.current.value)) {
     setNameMessage("이름을 확인해 주세요.");
     setIsName(false);
   } else {
     setNameMessage("사용가능한 이름입니다.");
     setIsName(true);
   }
 };

 const onChangeNickName = () => {
  const nickNameRegExp = /^[가-힣a-zA-Z0-9_]{2,10}$/;
   if (!nickNameRegExp.test(nickName.current.value)) {
     setNickNameMessage("2-10사이 한글, 영문, 숫자, '_' 만 입력가능!");
     setIsNickName(false);
   } else {
    // 닉네임 중복체크 
    axios.get(`${process.env.REACT_APP_API_URL}/member/dup-check/nickname?nickname=${nickName.current.value}`)
    .then((response) => {
      setNickNameMessage(response.data.message);
      if(response.data.message === '사용 가능한 닉네임입니다.') setIsNickName(true);
      else setIsNickName(false);
  })
  }
   
 };

 const onChangePassword = () => {
   const passwordRegExp =
     /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-])(?=.*[0-9]).{8,25}$/;
   if (!passwordRegExp.test(password.current.value)) {
     setPasswordMessage(
       "숫자+영문자+특수문자 조합으로 8자리 이상 25자 이하로 입력해주세요!"
     );
     setIsPassword(false);
   } else {
     setPasswordMessage("안전한 비밀번호 입니다.");
     setIsPassword(true);
   }
 };
 const onChangePasswordConfirm = () => {
   if (password.current.value !== passwordConfirm.current.value) {
     setPasswordConfirmMessage("비밀번호가 똑같지 않아요!");
     setIsPasswordConfirm(false);
   } else {
     setPasswordConfirmMessage("똑같은 비밀번호를 입력했습니다.");
     setIsPasswordConfirm(true);
   }
 };
 const onChangeEmail = () => {
   const emailRegExp =
     /^[A-Za-z0-9_]+[A-Za-z0-9]*[@]{1}[A-Za-z0-9]+[A-Za-z0-9]*[.]{1}[A-Za-z]{1,3}$/;

   if (!emailRegExp.test(email.current.value)) {
     setEmailMessage("이메일의 형식이 올바르지 않습니다!");
     setIsEmail(false);
    } else { 
    // 이메일 중복체크 
    axios.get(`${process.env.REACT_APP_API_URL}/member/dup-check/email?email=${email.current.value}`)
    .then((response) => {
      setEmailMessage(response.data.message);
      if(response.data.message ===  "사용 가능한 이메일입니다.") setIsEmail(true);
      else setIsEmail(false);
    });
  }
 }; 
 // 인증번호 일치 검사
  const onChangeAuthCode = () => {
    if (authCode.current.value !== AUTH_CODE) {
      setAuthMessage("인증번호 불일치!");
      setIsAuthCode(false);
    } else {
      setAuthMessage("인증번호일치");
      setIsAuthCode(true);
    }
  }

  const onChangeBirth = () => {
  const dateRegex1 = /^\d{4}-\d{2}-\d{2}$/; //? YYYY-MM-DD 형식의 정규식
  const dateRegex2 = /^(19|20)\d{2}-(0[1-9]|1[0-2])-([0-2][1-9]|3[01])$/; //YYYY-MM-DD 각 자리에 유효한 생년월일인지 확인
  
  if (dateRegex1.test(birth.current.value)) {
    if (dateRegex2.test(birth.current.value)) {
      setBirthMessage("유효한 생년월일입니다.")
      setIsBirth(true);
    } else {
      setBirthMessage("유효하지 않은 생년월일입니다.")
      setIsBirth(false);
    }
  } else {
    {
      setBirthMessage("유효하지 않은 생년월일입니다.")
      setIsBirth(false);
    }
  }
};

const doAuth = function() {
  setOpenAuthFoam(true);
  // 이메일로 인증코드 보내기.  /member/check/{email}
  axios.get(`${process.env.REACT_APP_API_URL}/member/check/email?email=${email.current.value}`)
  .then((response) => {
    console.log(response.data.code);
    setAUTH_CODE(response.data.code);
  })
}

const doRegist = () => {
  // 중복체크 및 인증 완료시 회원가입 성공
  const data = {
    "memberId": id.current.value,
    "memberPass": social_platform === undefined ? password.current.value : social_platform,//소셜로그인일 경우 소셜플랫폼으로 입력 (null 아님)
    "memberPlatform": social_platform === undefined ? "origin":social_platform  , //소셜로그인인지 일반로그인인지
    "memberName": name.current.value,
    "memberNickname": nickName.current.value,
    "memberEmail": email.current.value,
    "memberBirth": birth.current.value //형식 준수해야함
  };
  console.log(data)
  axios.post(`${process.env.REACT_APP_API_URL}/member/join`, data).then((response) => {console.log(response)})
}


 return (
   <>
   <h3>회원가입</h3>
     <div className="form">
       <div className="form-el">
         <label htmlFor="id">*아이디</label> <br />
         <input id="id" name="id" ref={id} onBlur={onChangeId} value={social_id} disabled={!!social_id}/>
         <p className="message"> {idMessage} </p>
       </div>
       <div className="form-el">  
         <label htmlFor="name">*이름</label> <br />
         <input id="name" name="name" ref={name} onBlur={onChangeName} />
         <p className="message">{nameMessage}</p>
       </div>
       <div className="form-el">  
         <label htmlFor="nickName">*닉네임</label> <br />
         <input id="nickName" name="nickName" ref={nickName} onBlur={onChangeNickName} />
         <p className="message">{nickNameMessage}</p>
       </div>
       <div className="form-el">
         <label htmlFor="password">*비밀번호</label> <br />
         <input
           id="password"
           name="password"
           ref={password}
           onBlur={onChangePassword}
           disabled={!!social_platform}
         />
         <p className="message">{passwordMessage}</p>
       </div>
       <div className="form-el">
         <label htmlFor="passwordConfirm">*비밀번호확인</label> <br />
         <input
           id="passwordConfirm"
           name="passwordConfirm"
           ref={passwordConfirm}
           onBlur={onChangePasswordConfirm}
           disabled={!!social_platform}
         />
         <p className="message">{passwordConfirmMessage}</p>
       </div>
       <div className="form-el">
         <label htmlFor="email">*이메일</label> <br />
         <input
           id="email"
           name="email"
           ref={email}
           onBlur={onChangeEmail}
         />
         <p className="message">{emailMessage}</p>
         <button disabled={!isEmail} onClick={doAuth}>인증하기</button>
        </div>
       {openAuthFoam && 
        <div className="form-el">
         <label htmlFor="authCode">*인증코드</label> <br />
         <input
           id="authCode"
           name="authCode"
           ref={authCode}
           onBlur={onChangeAuthCode}
         />
         <p className="message">{authMessage}</p>
       </div>
       }
       <div className="form-el">
         <label htmlFor="birth">*생년월일</label> <br />
         <input
          placeholder="YYYY-MM-DD"
           id="birth"
           name="birth"
           ref={birth}
           onBlur={onChangeBirth}
         />
         <p className="message">{birthMessage}</p>
       </div> 
       <br />
       <button onClick={doRegist} disabled={!(isId && isname && isPassword && isPasswordConfirm && isEmail && isBirth && isAuthCode)}>가입하기</button>
     </div>
   </>
 );
};

