<template>
  <div class="login">
      <img src="../assets/logo.png">
      <div style="width: 30%;">
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="账号" prop="accid">
            <el-input type="text" v-model.trim="ruleForm.accid" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="token">
            <el-input type="password" v-model="ruleForm.token" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">登陆</el-button>
            <el-button @click="resetForm('ruleForm')">注册</el-button>
          </el-form-item>
        </el-form>
      </div>

    <el-dialog style="text-align: left;" title="注册账号" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false" :close-on-press-escape="false">

      <el-form :model="reruleForm" status-icon :rules="rerules" ref="reruleForm" label-width="100px" style="width: 88%;">
        <el-form-item label="账号" prop="accid">
          <el-input type="text" v-model.trim="reruleForm.accid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input type="text" v-model.trim="reruleForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="token">
          <el-input type="password" v-model="reruleForm.token" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="registerAcount">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import SDK from '../assets/plugins/NIM_Web_SDK_v7.6.0.js'
  export default {
    name: 'Home',
    data () {
      var validatePass = (rule, value, callback) => {
        let rep = /^[a-z0-9]+$/
        if (value === '') {
          callback(new Error('请输入账号'))
        } else if (!rep.test(value)) {
          callback(new Error('请输入小写字母数字'))
        } else {
          callback()
        }
      }
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else if (value.length < 6) {
          callback(new Error('密码至少6个字符'))
        } else {
          callback()
        }
      }
      return {
        dialogVisible: false,
        ruleForm: {
          accid: '',
          token: ''
        },
        rules: {
          accid: [
            { validator: validatePass, trigger: 'blur' }
          ],
          token: [
            { validator: validatePass2, trigger: 'blur' }
          ]
        },
        reruleForm: {
          accid: '',
          token: '',
          name: ''
        },
        rerules: {
          accid: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { validator: validatePass, trigger: 'blur' }
          ],
          token: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: validatePass2, trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
          ]
        }
      }
    },
    mounted () {

    },
    methods: {
      // 登陆
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.handleLogin()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      // 登陆
      handleLogin() {
        let self = this
        let nim = SDK.NIM.getInstance({
          // debug: true,
          appKey: this.$store.getters.getAppKey,
          account: this.ruleForm.accid,
          token: this.ruleForm.token,
          // onfriends: this.onFriends,
          onconnect: function () {
            self.$message({
              message: '登陆成功',
              type: 'success'
            })
            // nim.disconnect()
            self.$store.dispatch('setNimWeb', nim)
            self.$store.dispatch('setAccId', self.ruleForm.accid)
            self.$store.dispatch('setToken', self.ruleForm.token)
            self.$router.push({name: 'Chat'})
            // 连接成功后才能发消息
          },
          ondisconnect: function (obj) {
            console.log('SDK 连接断开', obj)
          },
          onerror: function (error) {
            console.log('SDK 连接失败', error)
            self.$message({
              message: '登陆失败',
              type: 'success'
            })
          }
        })
      },
      onFriends(friends) {
        console.log('收到好友列表', friends)
      },
      // 注册账号
      resetForm(formName) {
        this.$refs[formName].resetFields()
        this.dialogVisible = true
        this.$nextTick((e) => {
          this.$refs['reruleForm'].resetFields()
        })
      },
      // 确定注册
      registerAcount() {
        this.$refs['reruleForm'].validate((valid) => {
          if (valid) {
            this.createAcount()
          } else {
            return false
          }
        })
      },
      // 创建账号 api
      createAcount() {
        let url = '/createUser'
        this.http.post(url, this.reruleForm).then((res) => {
          let data = res.data
          if (data && data.statusCode === 200) {
            this.$message({
              message: '注册成功',
              type: 'success'
            })
            this.dialogVisible = false
          } else {
            this.$message({
              message: '注册失败' + data.statusMsg,
              type: 'error'
            })
          }
        }).catch((e) => {
          this.$message({
            message: e.message,
            type: 'error'
          })
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .login {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
