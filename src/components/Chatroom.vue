<template>
  <div class="chat-div">
    <div class="chat-main-div">
      <div class="header">
          <div >
            <!--<el-input placeholder="请输入内容" v-model="input2" size="small" prefix-icon="el-icon-search">-->
            <!--</el-input>-->
            <el-button type="primary" icon="el-icon-plus" circle title="添加好友" @click="openAddFiends"></el-button>
            <el-badge  :value="offlineMsg > 0 ? offlineMsg : ''" class="item">
              <el-button  circle icon=" el-icon-chat-dot-round" @click="dialogTableVisible = true;" title="离线信息"></el-button>
            </el-badge>
          </div>
        <div class="header-right-item">
          <el-dropdown >
            <div class="header-avatar">
            {{ currentUserInfo.nick  | filterNick}}
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item  >
                <div @click="loginOutNIM" >
                  退出登陆
                </div>
                </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="chat-content-div">
          <div class="left-friends-div">

            <div class="friend-item-div" v-for="item in friendsData" @click="createChat(item)">
               <div class="friend-item-avatar">
                  {{ item.account | filterNick }}
               </div>
               <span class="friend-item-span">  {{  item.account }}  </span>
              <el-tag size="mini" v-show="item.unreader > 0">{{ item.unreader }}</el-tag>
            </div>
          </div>
          <div class="right-chatroom-div" >

            <div class="chat-content" v-show="currentToUserInfo.account !== null">
              <div class="chat-header">
                 <div class="friend-item-avatar">
                   {{ currentToUserInfo.account | filterNick }}
                 </div>
                <span class="friend-item-span">  {{  currentToUserInfo.account }} </span>
              </div>

              <div class="chat-msg" id="chat-msg-div" >
                <div v-for="item in chatRoomsMessage" v-show="showMsg">
                  <div style="text-align: left;" v-show="item.type === 'receive'">
                    <div class="msg-receive">
                     {{ item.text }}
                    </div>
                  </div>
                  <div style="text-align: right;" v-show="item.type === 'send'">
                    <div class="msg-send">
                      {{ item.text }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-send">
                <el-input
                  v-model.trim ="msg"
                  resize="none"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 4}"
                  placeholder="请输入内容">
                </el-input>
                <div class="send-footer">
                  <el-button type="danger" size="small" @click="msg = ''">清空</el-button>
                  <el-button type="primary" size="small" @click="sendMsg">发送</el-button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>


    <el-dialog  style="text-align: left;"  title="申请添加好友" :visible.sync="dialogFormVisible" width="30%" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="addform" :rules="rerules" ref="reruleForm"  label-width="80px">
        <el-form-item label="账号"  prop="accid">
          <el-input v-model.trim="addform.accid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注"  prop="ps">
          <el-input v-model.trim="addform.ps" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendAddFriends">发送请求</el-button>
      </div>
    </el-dialog>


    <el-dialog title="离线信息" :visible.sync="dialogTableVisible">
      <el-table :data="offlineSysMsgDatas">
        <el-table-column prop="time" label="日期" :formatter="formatDate">
        </el-table-column>
        <el-table-column prop="type" label="类型" ></el-table-column>
        <el-table-column prop="from" label="账号" ></el-table-column>
        <el-table-column prop="ps" label="备注信息"></el-table-column>
        <el-table-column prop="opt" label="操作">
          <template slot-scope="scope">
            <el-button @click="onSysMsg(scope.row)" type="text" size="small">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
  import SDK from '../assets/plugins/NIM_Web_SDK_v7.6.0.js'
  export default {
    name: "Chatroom",
    data () {
      var validateAccid = (rule, value, callback) => {
        if (value === this.$store.getters.getAccId) {
          callback(new Error('不能添加自己'))
        } else {
          callback()
        }
      }
      return {
        offlineMsg: 0,
        offlineSysMsgDatas: [],
        dialogTableVisible: false,
        showMsg: true,
        unReadechatMessage: {},
        chatMessage: {},
        chatRoomsMessage: [],
        msg: '',
        currentToUserInfo: {
          account: null
        },
        friendsData: [],
        sysMsg: null,
        nimObject: null,
        dialogFormVisible: false,
        currentUserInfo: {},
        addform: {
          accid: '',
          ps: ''
        },
        rerules: {
          accid: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { validator: validateAccid, trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      if (this.$store.getters.getAccId) {
        this.initNIMSDK()
      }
    },
    filters: {
      filterNick(nick) {
        if (nick) {
          return nick.substring(0, 1)
        } else {
          return 'T'
        }
      }
    },
    mounted () {
      console.log('nim-web', this.$store.getters.getNimWeb)
      this.$nextTick((e) => {
        this.nimObject.getFriends({
          done: this.getFriendsDone
        })
      })
    },
    methods: {
      formatDate(row, column, cellValue, index) {
        let dateStr = ''
        let date = new Date(row.time)
        dateStr =  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          + ' '+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        return dateStr
      },
      showUnread(acount) {
        if (this.unReadechatMessage[acount]) {
          return this.unReadechatMessage[acount].length
        }
        return 0
      },
      sendMsg() {
        var msg = this.nimObject.sendText({
          scene: 'p2p',
          to: this.currentToUserInfo.account,
          text: this.msg
        })
        this.updateMessaeData('', this.currentToUserInfo.account)
        this.msg = ''
        console.log('正在发送p2p text消息, id=' + msg.idClient)
      },
      loginOutNIM() {
        console.log(' loginOut')
        this.nimObject.disconnect()
        this.nimObject = null
        this.$store.dispatch('setNimWeb', null)
        this.$router.push({name: 'Login'})
      },
      initNIMSDK() {
        let self = this
        this.nimObject = SDK.NIM.getInstance({
          // debug: true,
          appKey: this.$store.getters.getAppKey,
          account: this.$store.getters.getAccId,
          token: this.$store.getters.getToken,
          // customTag: 'TV',
          // 用户关系
          onblacklist: this.onBlacklist,
          onsyncmarkinblacklist: this.onMarkInBlacklist,
          onmutelist: this.onMutelist,
          onsyncmarkinmutelist: this.onMarkInMutelist,
          // 好友关系
          syncFriends: false,
          onfriends: this.onFriends,
          onsyncfriendaction: this.onSyncFriendAction,
          // 用户名片
          onmyinfo: this.onMyInfo,
          // 会话
          onsessions: this.onSessions,
          onupdatesession: this.onUpdateSession,
          // 消息
          onroamingmsgs: this.onRoamingMsgs,
          onofflinemsgs: this.onOfflineMsgs,
          onmsg: this.onMsg,
          // 系统通知
          onofflinesysmsgs: this.onOfflineSysMsgs,
          onsysmsg: this.onSysMsg,
          onupdatesysmsg: this.onUpdateSysMsg,
          onsysmsgunread: this.onSysMsgUnread,
          onupdatesysmsgunread: this.onUpdateSysMsgUnread,
          onofflinecustomsysmsgs: this.onOfflineCustomSysMsgs,
          oncustomsysmsg: this.onCustomSysMsg,
          // 收到广播消息
          onbroadcastmsg: this.onBroadcastMsg,
          onbroadcastmsgs: this.onBroadcastMsgs,
          // 同步完成
          onsyncdone: this.onSyncDone,
          onconnect: function () {
            // 连接成功后才能发消息
          },
          ondisconnect: function (obj) {
            console.log('SDK 连接断开', obj)
            self.$message({
              message: '退出登陆成功',
              type: 'success'
            })
            self.$router.push({name: 'Login'})
          },
          onerror: function (error) {
            console.log('SDK 连接失败', error)
            self.$message({
              message: '连接失败',
              type: 'success'
            })
          }
        })
      },
      onMyInfo(user) {
        console.log('收到我的名片', user)
        this.currentUserInfo = user
      },
      openAddFiends() {
        this.dialogFormVisible = true
        this.$nextTick((e) => {
          this.$refs['reruleForm'].resetFields()
        })
      },
      sendAddFriends() {
        this.$refs['reruleForm'].validate((valid) => {
          if (valid) {
            console.log('form:', this.addform)
            let accid = this.addform.accid
            let ps = this.addform.ps
            this.nimObject.applyFriend({
              account: accid,
              ps: ps,
              done: this.applyFriendDone
            })
            this.dialogFormVisible = false
          } else {
            return false
          }
        })
      },
      applyFriendDone(error, obj) {
        console.log(error)
        console.log(obj)
        console.log('申请加为好友' + (!error ? '成功' : '失败'))
      },
      onBlacklist(blacklist) {
        console.log('收到黑名单', blacklist)
      },
      onMarkInBlacklist(obj) {
        console.log(obj.account + '被你在其它端' + (obj.isAdd ? '加入' : '移除') + '黑名单')
      },
      onMutelist(mutelist) {
        console.log('收到静音列表', mutelist)
      },
      onMarkInMutelist(obj) {
        console.log(obj)
        console.log(obj.account + '被你' + (obj.isAdd ? '加入' : '移除') + '静音列表')
      },
      onFriends(friends) {
        console.log('收到好友列表', friends)
        this.friendsData = friends
      },
      onSyncFriendAction(obj) {
        console.log(obj)
      },
      onSessions(sessions) {
        console.log('收到会话列表', sessions)
      },
      onUpdateSession(session) {
        console.log('会话更新了', session)
      },
      onRoamingMsgs(obj) {
        console.log('漫游消息', obj)
      },
      onOfflineMsgs(obj) {
        console.log('离线消息', obj)
        let msgs = obj.msgs
        if (msgs && msgs.length > 0) {
          for (let i = 0; i < msgs.length; i++) {
            this.updateMessaeData(msgs[i], msgs[i].from)
            this.updateUnReaderMsg(msgs[i], msgs[i].from)
          }
        }
        console.log('离线消息:::', this.chatMessage)
      },
      onMsg(msg) {
        console.log('收到消息', msg.scene, msg.type, msg)
        this.updateMessaeData(msg, msg.from)
        this.showMsg = true
        if (msg.from !== this.currentToUserInfo.account) {
          this.updateUnReaderMsg(msg, msg.from)
          this.showMsg = false
        }
      },
      updateUnReaderMsg(msg, acouont) {
        if (msg.scene === 'p2p') {
          let message = {
            type: 'receive',
            text: msg.text
          }
          if (this.unReadechatMessage[acouont]) {
            this.unReadechatMessage[acouont].push(message)
          } else {
            this.unReadechatMessage[acouont] = []
            this.unReadechatMessage[acouont].push(message)
          }
          let data = []
          data = data.concat(this.friendsData)
          this.friendsData = []
          for (let i = 0; i < data.length; i++) {
            if (data[i].account === acouont) {
              data[i]['unreader'] = this.unReadechatMessage[acouont].length
            }
          }
          this.friendsData = this.friendsData.concat(data)
          console.log(' this.friendsData: ',  this.friendsData)
        }
      },
      updateMessaeData(msg, acouont) {
        let message = {}
        if (!msg) {
          message = {
            type: 'send',
            text: this.msg
          }
        }
        if (msg.scene === 'p2p') {
          message = {
            acouont: acouont,
            type: 'receive',
            text: msg.text
          }
        }
        if (this.chatMessage[acouont]) {
          this.chatMessage[acouont].push(message)
        } else {
          this.chatMessage[acouont] = []
          this.chatMessage[acouont].push(message)
        }
        this.chatRoomsMessage = this.chatMessage[acouont]
        console.log('chatRoomsMessage: ', acouont, this.chatRoomsMessage)
        this.$nextTick((e) => {
          let div = document.getElementById('chat-msg-div')
          div.scrollTop = div.scrollHeight
        })
      },
      onOfflineSysMsgs(sysMsgs) {
        console.log('收到离线系统通知', sysMsgs)
        this.offlineSysMsgDatas = []
        for (let i = 0; i < sysMsgs.length; i++) {
          if (sysMsgs[i].type === 'applyFriend') {
            this.offlineSysMsgDatas.push(sysMsgs[i])
          }
        }
        this.offlineMsg = this.offlineSysMsgDatas.length
        console.log('dialogFormVisible:', this.offlineSysMsgDatas)
      },
      onSysMsg(sysMsg) {
        console.log('收到系统通知', sysMsg)
        this.sysMsg = sysMsg
        if (!sysMsg) {
          return
        }
        this.handleSysMsg(sysMsg)
      },
      handleSysMsg(sysMsg) {
        switch (sysMsg.type) {
          case 'applyFriend': // 申请请求好友
            console.log('')
            this.nimObject.getUser({
              account: sysMsg.from,
              done: this.getUserDone
            })
            break
          case 'passFriendApply': // 同意请求好友
            console.log('')
            this.$message({
              message: '账号' + sysMsg.from + '，同意了你的好友请求',
              type: 'success'
            })
            this.nimObject.getFriends({
              done: this.getFriendsDone
            })
            break
          case 'rejectFriendApply': // 拒绝请求好友
            console.log('')
            this.$message({
              message: '账号' + sysMsg.from + '，拒绝了你的好友请求',
              type: 'success'
            })
            break
          default:
            console.log('onSysMsg')
        }
      },
      onUpdateSysMsg(sysMsg) {
        console.log('收到系统通知 onUpdateSysMsg', sysMsg)
      },
      onSysMsgUnread(obj) {
        console.log('收到系统通知未读数', obj)
      },
      onUpdateSysMsgUnread(obj) {
        console.log('系统通知未读数更新了', obj)
      },
      onOfflineCustomSysMsgs(sysMsgs) {
        console.log('收到离线自定义系统通知', sysMsgs)
      },
      onCustomSysMsg(sysMsg) {
        console.log('收到自定义系统通知', sysMsg)
      },
      onBroadcastMsg(msg) {
        console.log('收到广播消息', msg)
      },
      onBroadcastMsgs(msgs) {
        console.log('收到广播消息列表', msgs)
      },
      onSyncDone() {
        console.log('同步完成')
      },
      getUserDone(error, user) {
        console.log(error)
        console.log(user)
        if (!error) {
          this.$confirm(user.nick + '请求添加好友,是否同意？', '好友请求', {
            confirmButtonText: '同意',
            cancelButtonText: '拒绝',
            type: 'warning'
          }).then(() => {
            this.nimObject.passFriendApply({
              idServer: this.sysMsg.idServer,
              account: user.account,
              ps: '同意',
              done: this.passFriendApplyDone
            })
          }).catch(() => {
            this.nimObject.rejectFriendApply({
              idServer: this.sysMsg.idServer,
              account: user.account,
              ps: '拒绝',
              done: this.passFriendApplyDone
            })
          })
        }
      },
      passFriendApplyDone(error, obj) {
        console.log('通过好友申请' + (!error ? '成功' : '失败'))
      },
      getFriendsDone(error, friends) {
        console.log('获取好友列表' + (!error ? '成功' : '失败'), error, friends)
        if (!error) {
          this.friendsData = friends
        }
      },
      createChat(item) {
        this.showMsg = true
        this.currentToUserInfo = item
        if (this.chatMessage[item.account]) {
          this.chatRoomsMessage = this.chatMessage[item.account]
        } else {
          this.chatMessage[item.account] = []
          this.chatRoomsMessage = []
        }
        console.log('createChat: ', this.chatRoomsMessage)
        if (this.unReadechatMessage[item.account]) {
          this.unReadechatMessage[item.account] = []
          for (let i = 0; i < this.friendsData.length; i++) {
            if (this.friendsData[i].account === item.account) {
              this.friendsData[i]['unreader'] = 0
            }
          }
        }
      }

    }
  }
</script>

<style scoped>

  .chat-div {
     width: 100%;
     height: 100%;
    /*padding: 5px;*/
    background: url("../assets/chatbg.jpg");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .chat-main-div {
    width: 800px;
    height: 600px;
  }
  .header {
    padding: 0px 12px;
    width: 97%;
    height: 50px;
    display: flex;
    background: royalblue;
    align-items: center;
    justify-content: space-between;
  }
  .chat-content-dvi {
    height: calc(100% - 50px);
  }
  .header-avatar {
    cursor: pointer;
    background: #409EFF;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    font-size: 2rem;
    color: #fff;
  }
  .header-avatar:hover .avatar-opt{
    color: red;
  }



  .header-right-item{
    display: flex;
    justify-content: center;
  }
  .avatar-opt {
    position: absolute;
    margin-top: 42px;
  }
  .chat-content-div {
    display: flex;
    flex: 1;
    height: 100%;
  }
  .left-friends-div {
    width: 200px;
    background: white;
    overflow-y: auto;
  }
  .right-chatroom-div {
    flex-grow: 1;
    background: aliceblue;
    padding: 10px;
  }

  .friend-item-div {
    height: 45px;
    line-height: 45px;
    text-align: left;
    display: flex;
    align-items: center;
    border-bottom: 1px #E4E7ED solid;
    cursor: pointer;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    padding-left: 5px;
  }
  .friend-item-div:hover {
    background: #DCDFE6;
  }
  .friend-item-div:active {
    background: #409EFF;
  }
  .friend-item-avatar{
    background: #E6A23C;
    width: 40px;
    height: 40px;
    display: inline-block;
    border-radius: 40px;
    text-align: center;
    line-height: 40px;
    color: #fff;
    font-size: 28px;
  }
  .friend-item-span {
    padding-left: 5px;
    font-size: 18px;
    color: #303133;
  }
  .chat-header {
    height: 40px;
    text-align: left;
    padding: 5px;
    border-bottom: 1px #E4E7ED solid;
  }

  .chat-content {
    width: 100%;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    border-radius: 6px;
  }
  .chat-msg {
    height: calc(100% - 186px);
    overflow-y: auto;
  }
  .send-footer{
    text-align: right;
    padding: 4px 2px 0px 0px;
  }

  .msg-receive{
    max-width: 300px;
    min-height: 30px;
    padding: 10px;
    background: #ffffff;
    margin: 10px;
    text-align: left;
    word-break: break-all;
    border: 1px #DCDFE6 solid;
    border-top-right-radius: 28px;
    font-size: 18px;
    border-bottom-left-radius: 28px;
    display: inline-block;
  }

  .msg-send {
    display: inline-block;
    min-height: 30px;
    padding: 10px;
    background: #ffffff;
    margin: 10px;
    text-align: left;
    word-break: break-all;
    border: 1px #409EFF solid;
    border-top-left-radius: 28px;
    font-size: 18px;
    border-bottom-right-radius: 28px;
    max-width: 300px;
  }


</style>
