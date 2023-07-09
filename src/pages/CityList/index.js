import React, { Component } from 'react'

import { Toast } from 'antd-mobile'

import NavHeader from '../../components/NavHeader'
import './index.scss'
import axios from 'axios'
 import {getCurrentCity} from '../../utils/index'
import {List,AutoSizer} from 'react-virtualized'




const formatCityData = (list) =>{

  const cityList = {}
  
  list.forEach(item => {
    const first = item.short.substr(0,1)
    if(cityList[first]){
      cityList[first].push(item)
    }else{
      cityList[first]= [item]
    }
  })

  const cityIndex = Object.keys(cityList).sort()

  

  return {
    cityList,
    cityIndex,
  }

}

const formatCityIndex = (letter) =>{
  switch (letter) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热门城市'
    default:
      return letter.toUpperCase();
  }
}



// 索引（A、B等）的高度
const TITLE_HEIGHT = 36
// 每个城市名称的高度
const NAME_HEIGHT = 50

//有房源数据的几个城市
const HOUSE_CITY = ['北京','上海','广州','深圳']

export default class CityList extends Component {

  state = {
    cityList: {},
    cityIndex: [],
    // 指定右侧字母索引列表高亮的索引号
    activeIndex: 0,
    scrollToIndex:0
  }


  changeCity=({label,value})=>{
    if(HOUSE_CITY.indexOf(label)>-1){
      localStorage.setItem('hkzf_city',JSON.stringify({label,value}))
      this.props.history.go(-1)
    }else{
      Toast.info("该城市暂无房源信息",1,null,false)
    }
  }


  componentDidMount(){
    this.getCityList()
  }
  //获取城市列表数据
  async getCityList() {
    const res = await axios.get('http://localhost:8080/area/city?level=1')
    const { cityList, cityIndex } = formatCityData(res.data.body)

    // 获取热门城市数据
    const hotRes = await axios.get('http://localhost:8080/area/hot')
    cityList['hot'] = hotRes.data.body
    cityIndex.unshift('hot')

    // 获取当前定位城市
    const curCity = await getCurrentCity()
    cityList['#'] = [curCity]
    cityIndex.unshift('#')

    this.setState({
      cityList,
      cityIndex
    })
  }


  rowRenderer =({
    key, // Unique key within array of rows
    index, // 索引号
    isScrolling, // 当前项是否正在滚动中
    isVisible, // 当前项在 List 中是可见的
    style // 注意：重点属性，一定要给每一个行数据添加该样式！作用：指定每一行的位置
  }) =>
  {

    const { cityIndex,cityList } = this.state
    const letter = cityIndex[index]
    


    return (
      <div key={key} style={style} className='city'>
        <div className='title'>{formatCityIndex(letter)}</div>
        <div className='name'>
          {
            cityList[letter].map(item => <div className='name' key={item.value} onClick={()=>{
              this.changeCity(item)
            }}>{item.label}</div>)
          }
        </div>
      </div>
    )
  }


  getRowHeight =({index}) =>{
    const {cityList,cityIndex} = this.state
    return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
  }


  OnRowsRendered = ({startIndex}) =>{
    if(this.state.activeIndex !== startIndex){
      this.setState({
        activeIndex:startIndex
      })
    }
  }

  RenderCityIndex(){
    return this.state.cityIndex.map((item,index) => 
      <li className='city-index-item' key={item} onClick={()=>{
         this.setState({
           scrollToIndex:index,
           activeIndex:index,
         })
      }}>
      <span className={this.state.activeIndex === index ? 'index-active':''}>{item === 'hot' ? '热' : item.toUpperCase()}</span>
      </li>
      )
  }

  render() {
    return (
      <div className='citylist'>    
      <NavHeader>
        城市选择
      </NavHeader>

      {/* 城市列表 */}
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={this.cityListComponent}
            width={width}
            height={height}
            rowCount={this.state.cityIndex.length}
            rowHeight={this.getRowHeight}
            rowRenderer={this.rowRenderer}
            onRowsRendered={this.OnRowsRendered}
            scrollToAlignment='start'
            scrollToIndex={this.state.scrollToIndex}
          />
        )}
      </AutoSizer>
      
      {/*右侧索引列表*/}
      <ul className='city-index'>
          {this.RenderCityIndex()}
      </ul>          

    </div>
    )
  }
}
