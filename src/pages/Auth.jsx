import React, { Component } from 'react'
import './auth.css'
import { Button } from 'antd'
import globalData from '../utils/globalData'
import StringUtils from '../utils/stringUtils'
import { Redirect } from 'react-router-dom'
import Api from '../utils/api'
class Auth extends Component {

  constructor(props) {
    super(props)

    this.onClickAuth = this.onClickAuth.bind(this)
    this.hasCode = false
    
    this.state = {
      authUrl: 'https://github.com/login/oauth/authorize',
      hasCode: false,
      isTokenError: false
    }
  }

  componentWillUpdate(nextProps) {
    console.log('componentWillUpdate', nextProps)
    // 判断token是否存在如果存在直接跳转到star页面
    if (globalData.token) {
      this.go2star();
      return;
    }

    // 从url当中设置数据
    this.saveCodeByUrl(nextProps.location.search)
  }

  componentDidMount() {
    this.initAuthUrl()
    
    console.log("componentDidMount", this.hasCode, this.props)
  }

  /**
   * 点击授权
   */
  onClickAuth() {
    window.location.href = this.state.authUrl
  }

  /**
   * 初始化授权地址
   */
  initAuthUrl() {
    let authUrl = this.state.authUrl
    authUrl = `${authUrl}?client_id=${globalData.CLIENT_ID}`
    authUrl = `${authUrl}&scope=${this.getAuthScop()}`
    authUrl = `${authUrl}&redirect_uri=http://localhost:3000/auth`
    this.setState({
      authUrl
    })
  }

  /**
   * 获取授权范围
   */
  getAuthScop() {
    const scopes = [
      'user',
      'public_repo'
    ]
    const scopesStr = scopes.join(" ")
    return scopesStr
  }

  /**
   * 保存token
   */
  saveCodeByUrl(url) {
    if (StringUtils.isBlank(url)) {
      return
    }
    

    let code;
    if (url.indexOf('code') >= 0) {
      code = StringUtils.getQueryVariable('code')
      globalData.setCode(code) 
      // 跳转到 star界面
      this.hasCode = true
    } else {
      this.hasCode = false
    }
    console.log("saveCodeByUrl", code)
    this.auth(code)

    console.log("saveTokenByUrl", this.hasCode)
  }


  /**
   * 获取token
   */
  auth(code) {
    Api.auth(code).then((res) => {
      console.log(res)
      this.handleAuthSuccessResponse(res)
    }).catch(e => {
      console.log(e)
    })
  }

  /**
   * 处理授权成功的情况
   */
  handleAuthSuccessResponse(res) {
    if (res.data.hasOwnProperty('access_token')) {
      const token = res.data.access_token;
      globalData.setToken(token);
      // utils.initHeaders();
      this.go2star();
    } else {
      this.go2home();
    }
  }

  /**
   * 返回首页
   */
  go2home() {
    this.props.history.replace('/auth');
  }

  /**
   * 前往star界面
   */
  go2star() {
    this.props.history.push('/star');
  } 

  render() {
    console.log("render", this.state.hasCode)
    return (
      <div className="Auth">
        <Button className="btn-auth" onClick={this.onClickAuth}>
          点击授权
        </Button>
      </div>
    )
  }
}

export default Auth
