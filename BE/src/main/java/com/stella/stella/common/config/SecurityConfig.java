package com.stella.stella.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.stella.stella.Jwt.JwtAuthenticationFilter;
import com.stella.stella.Jwt.JwtTokenProvider;
import com.stella.stella.member.controller.MemberController;
import com.stella.stella.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtTokenProvider jwtTokenProvider;
	private final MemberRepository memberRepository;
	private final AuthenticationManagerBuilder authenticationManagerBuilder;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.httpBasic().disable().csrf().disable().sessionManagement()
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS).and().authorizeRequests()
				.requestMatchers("/member/login/**").permitAll()
				.requestMatchers("/member/join/**").permitAll()
				.requestMatchers("/follow/**").permitAll()
				.requestMatchers("/member/dup-check/**").permitAll()
				.requestMatchers("/member/test").hasRole("USER")
//                .requestMatchers("/member/test").hasAnyRole("USER","ADMIN")
				.anyRequest().authenticated().and().addFilterBefore(
						new JwtAuthenticationFilter(jwtTokenProvider, memberRepository, authenticationManagerBuilder),
						UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}
}