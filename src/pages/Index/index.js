import React, { Component } from 'react'
import { Carousel,Flex,Grid,WingBlank } from 'antd-mobile';
import { getCurrentCity } from '../../utils'
import axios from 'axios'


import './index.scss'

import Nav1 from '../../assets/images/nav-1.png'
import Nav2 from '../../assets/images/nav-2.png'
import Nav3 from '../../assets/images/nav-3.png'
import Nav4 from '../../assets/images/nav-4.png'


const navs = [
    {
      id:1,
      img:Nav1,
      title:'整租',
      path:'/home/list'
    },
    {
      id:2,
      img:Nav2,
      title:'合租',
      path:'/home/list'
    },
    {
      id:3,
      img:Nav3,
      title:'地图找房',
      path:'/home/list'
    },
    {
      id:4,
      img:Nav4,
      title:'去出租',
      path:'/home/list'
    }
]


export default class Index extends Component {
  state = {
    swipers:[],
    isSwiperLoaded:false,
    groups:[],
    news:[],
    curCityName:''
  }

  async getSwipers(){
    const res = await axios.get('http://localhost:8080/home/swiper')
    this.setState({
      swipers:res.data.body,
      isSwiperLoaded:true
    })
  }

  async getGroups(){
    const res = await axios.get('http://localhost:8080/home/groups',{
      params:{
        area:'AREA%7C88cff55c-aaa4-e2e0'
      }
    })
    this.setState({
      groups:res.data.body
    })
    
  }

  async getNews(){
    const res = await axios.get('http://localhost:8080/home/news',{
      params:{
        area:'AREA%7C88cff55c-aaa4-e2e0'
      }
    })
    this.setState({
      news:res.data.body
    })
  }

  async componentDidMount() {
    this.getSwipers()
    this.getGroups()
    this.getNews()
    const curCity = await getCurrentCity()
    this.setState({
      curCityName: curCity.label
    })
  }


  

  renderSwipers(){
   return this.state.swipers.map(val => (
      <a
        key={val.id}
        href="http://www.alipay.com"
        style={{ display: 'inline-block', width: '100%', height: 212 }}
      >
        <img
          src={`http://localhost:8080${val.imgSrc}`}
          alt=""
          style={{ width: '100%', verticalAlign: 'top' }}
        />
      </a>
    ))
  }


  renderNavs(){
    return navs.map(
      item=>(<Flex.Item key={item.id} onClick={()=>this.props.history.push(item.path)}>
      <img src={item.img} alt=''/>
      <h2>{item.title}</h2>
    </Flex.Item>
    ))
  }
  
  renderNews(){
    return this.state.news.map(item=>
      <div className='news-item' key={item.id}>
        <div className='imgwrap'>
          <img className='img' src={`http://localhost:8080${item.imgSrc}`} alt=''/>
        </div>
        <Flex className='context' direction='column' justify='between'>
          <h3 className='title'>{item.title}</h3>
          <Flex className='info' justify='between'>
            <span>{item.from}</span>
            <span>{item.date}</span>
          </Flex>
        </Flex>
      </div>
    )
  }

  render() {
    return (
      <div className='index'>
        
        {/* 轮播图 */}
        <div className='swiper'>
        {
          this.state.isSwiperLoaded ? 
          <Carousel autoplay infinite autoplayInterval={5000}>
          {this.renderSwipers()}
         </Carousel> : ''
        }

        {/* 搜索框 */}
        <Flex className='search-box' justify='between'>
          <Flex className='search' >
            <div className='location' onClick={()=>this.props.history.push('/citylist')}>
              <span className='name'>{this.state.curCityName}</span>
              <i className='iconfont icon-arrow'/>
            </div>
            <div className='form' onClick={()=>this.props.history.push('/search')}>
              <i className='iconfont icon-search '/>
              <span className='text'>请输入小区或地址</span>
            </div>
          </Flex>
          <i className='iconfont icon-map' onClick={()=>this.props.history.push('/map')}/>
        </Flex>

        </div>


        {/* 导航 */}
        <Flex className='nav'>
        {this.renderNavs()}
        </Flex>

        {/* 租房小组 */}
        <div className='group'>
          <h3 className='group-title'>
            租房小组<span className='more'>更多</span>
          </h3>

          <Grid
            data={this.state.groups}
            columnNum={2}
            square={false}
            hasLine={false}
            renderItem={item => (
              <Flex className="group-item" justify="around" key={item.id}>
                <div className="desc">
                  <p className="title">{item.title}</p>
                  <span className="info">{item.desc}</span>
                </div>
                <img src={`http://localhost:8080${item.imgSrc}`} alt="" />
              </Flex>
            )}
          />

        </div>

        {/* 最新资讯 */} 
        <div className='news'>
          <h3 className='group-title'>
            最新资讯
          </h3>
          <WingBlank size='md'>
            {this.renderNews()}
          </WingBlank>
        </div>       
      </div>
    );
  }
}
