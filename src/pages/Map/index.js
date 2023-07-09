import React from 'react'

// 导入axios
import axios from 'axios'

// 导入封装好的 NavHeader 组件
import NavHeader from '../../components/NavHeader'

// 导入样式
// import './index.scss'
import styles from './index.module.css'
import { Toast } from 'antd-mobile'
// 解决脚手架中全局变量访问的问题
const BMap = window.BMapGL

// 覆盖物样式
const labelStyle = {
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  padding: '0px',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  color: 'rgb(255, 255, 255)',
  textAlign: 'center'
}

export default class Map extends React.Component {
  state = {
    housesList: [],
    isShowList:false
  }

  componentDidMount() {
    this.initMap()
  }

  // 初始化地图
  initMap() {
    // 获取当前定位城市
    const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))
    // console.log(label, value)

    // 初始化地图实例
    const map = new BMap.Map('container')
    // 作用：能够在其他方法中通过 this 来获取到地图对象
    this.map = map
    // 创建地址解析器实例
    const myGeo = new BMap.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      label,
      async point => {
        if (point) {
          //  初始化地图
          map.centerAndZoom(point, 11)
          // 添加常用控件
          map.addControl(new BMap.ZoomControl())
          map.addControl(new BMap.ScaleControl())

          // 调用 renderOverlays 方法
          this.renderOverlays(value)
        }
      },
      label
    )

    map.addEventListener('movestart',()=>{
      this.setState({
        isShowList:false
      })
    })
  }

  // 渲染覆盖物入口
  // 1 接收区域 id 参数，获取该区域下的房源数据
  // 2 获取房源类型以及下级地图缩放级别
  async renderOverlays(id) {
    Toast.loading('加载中',0,null,false)
    const res = await axios.get(`http://localhost:8080/area/map?id=${id}`)
    Toast.hide()
    // console.log('renderOverlays 获取到的数据：', res)
    const data = res.data.body

    // 调用 getTypeAndZoom 方法获取级别和类型
    const { nextZoom, type } = this.getTypeAndZoom()

    data.forEach(item => {
      // 创建覆盖物
      this.createOverlays(item, nextZoom, type)
    })
  }

  // 计算要绘制的覆盖物类型和下一个缩放级别
  // 区   -> 11 ，范围：>=10 <12
  // 镇   -> 13 ，范围：>=12 <14
  // 小区 -> 15 ，范围：>=14 <16
  getTypeAndZoom() {
    // 调用地图的 getZoom() 方法，来获取当前缩放级别
    const zoom = this.map.getZoom()
    let nextZoom, type

    // console.log('当前地图缩放级别：', zoom)
    if (zoom >= 10 && zoom < 12) {
      // 区
      // 下一个缩放级别
      nextZoom = 13
      // circle 表示绘制圆形覆盖物（区、镇）
      type = 'circle'
    } else if (zoom >= 12 && zoom < 14) {
      // 镇
      nextZoom = 15
      type = 'circle'
    } else if (zoom >= 14 && zoom < 16) {
      // 小区
      type = 'rect'
    }

    return {
      nextZoom,
      type
    }
  }

  // 创建覆盖物
  createOverlays(data, zoom, type) {
    const {
      coord: { longitude, latitude },
      label: areaName,
      count,
      value
    } = data

    // 创建坐标对象
    const areaPoint = new BMap.Point(longitude, latitude)

    if (type === 'circle') {
      // 区或镇
      this.createCircle(areaPoint, areaName, count, value, zoom)
    } else {
      // 小区
      this.createRect(areaPoint, areaName, count, value)
    }
  }

  // 创建区、镇覆盖物
  createCircle(point, name, count, id, zoom) {
    // 创建覆盖物
    const label = new BMap.Label('', {
      position: point,
      offset: new BMap.Size(-35, -35)
    })

    // 给 label 对象添加一个唯一标识
    label.id = id

    // 设置房源覆盖物内容
    label.setContent(`
      <div class="${styles.bubble}">
        <p class="${styles.name}">${name}</p>
        <p>${count}套</p>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 添加单击事件
    label.addEventListener('click', (e) => {
      // 调用 renderOverlays 方法，获取该区域下的房源数据
      this.renderOverlays(id)

      // 放大地图，以当前点击的覆盖物为中心放大地图
      this.map.centerAndZoom(point, zoom)
      this.map.clearOverlays()
      
      const target = e.domEvent.changedTouches[0]
      this.map.panBy(
        window.innerWidth/2-target.clientX,(window.innerHeight-330)/2-target.clientY
      )

    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  // 创建小区覆盖物
  /* 
    <div class="${styles.rect}">
      <span class="${styles.housename}">${name}</span>
      <span class="${styles.housenum}">${num}套</span>
      <i class="${styles.arrow}"></i>
    </div>
  */
  createRect(point, name, count, id) {
    // 创建覆盖物
    const label = new BMap.Label('', {
      position: point,
      offset: new BMap.Size(-50, -28)
    })

    // 给 label 对象添加一个唯一标识
    label.id = id

    // 设置房源覆盖物内容
    label.setContent(`
      <div class="${styles.rect}">
        <span class="${styles.housename}">${name}</span>
        <span class="${styles.housenum}">${count}套</span>
        <i class="${styles.arrow}"></i>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 添加单击事件
    label.addEventListener('click', () => {
      this.getHousesList(id)
    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  async getHousesList(id) {
    Toast.loading('加载中',0,null,false)
    const res = await axios.get(`http://localhost:8080/houses?cityId=${id}`)
    Toast.hide()
    this.setState({
      housesList: res.data.body.list,
      isShowList:true
    })
  }

renderHouseList(){
  return(this.state.housesList.map(item => 
    <div className={styles.house} key={item.houseCode}>
      <div className={styles.imgWrap}>
        <img className={styles.img} src={`http://localhost:8080${item.houseImg}`} alt="" />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.desc}>{item.desc}</div>
        <div>
          {item.tags.map(tag => 
            <span className={[styles.tag, styles.tag1].join(' ')} key={tag}>{tag}</span>
          )}
        </div>
        <div className={styles.price}>
          <span className={styles.priceNum}>{item.price}</span> 元/月
        </div>
      </div>
    </div>
  ))
}

  render() {
    return (
      <div className={styles.map}>
        {/* 顶部导航栏组件 */}
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器元素 */}
        <div id="container" className={styles.container} />

        {/* 房源列表 */}
        <div className={[styles.houseList, this.state.isShowList ? styles.show : ''].join(' ')}>
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <a className={styles.titleMore} href="/house/list">
              更多房源
            </a>
          </div>
          <div className={styles.houseItems}>
            {this.renderHouseList()}
          </div>
        </div>
      </div>
    )
  }
}
