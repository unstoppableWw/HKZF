import React from 'react'
import { NavBar } from 'antd-mobile'
import { withRouter } from 'react-router-dom'

import './index.scss'

function NavHeader({children,history,onLeftClick}) {

const defaultHandler = ()=> history.go(-1)

  return(
    <NavBar
    className='navbar'
    mode="light"
    icon={<i className='iconfont icon-back'/>}
    onLeftClick={onLeftClick || defaultHandler}>
      {children}
    </NavBar>
  )
}

export default withRouter(NavHeader)