<!--
 * @Descripttion:项目中具体使用参考
 * @Author: qj
 * @Date: 2024-03-07 10:56:40
-->

<template>
  <div style="padding:15px">
    <VueTestcaseMinderEditor
      v-if="mindFlag"
      @afterMountEditor="afterMountEditor"
      @changeNodeLabel="changeNodeLabel"
      @handleAppendSiblingNode="handleAppendSiblingNode"
      @handleAppendChildNode="handleAppendChildNode"
      @handleDel="handleDel"
      :initJson="initJsonD"
      ref="minderEditor"
      :sceneViewName="sceneViewName"
      :showHeaderFlag="true"
      :showNavigatorFlag="true"
      :allowEditPriority="true"
      :allowEditLabel="true"
      :allowEditResult="true"
      :allowEditNode="true"
      class="vueTestcaseMinderEditor"
    ></VueTestcaseMinderEditor>
    <div class="backBtn">
      <el-button type="text" @click="cancel">
        返回
        <i class="el-icon-right el-icon--right"></i>
      </el-button>
    </div>
    <div class="saveBtn">
      <el-button size="small" type="primary" @click="saveMind(true)">保存</el-button>
    </div>
    <Shortcuts />
    <DialogTPList ref="dialogTPList" :currentNode="currentNode" :projectId="projectId" />
  </div>
</template>

<script>
import { getCurrentProjectID } from "@/common/js/utils";
import "testcase-factor-minder-editor/lib/VueTestcaseMinderEditor.css";
// import { mapActions, mapMutations, mapGetters, mapState } from "vuex";
import IsChangeConfirm from "@/business/components/common/components/IsChangeConfirm";
import DialogTPList from "./componentFactor/DialogTPList";
import Shortcuts from "./componentFactor/Shortcuts";
import { jsonToMap } from "../../../../common/js/utils";
// 初始化数据，加载脑图时自动更新。同时也会监听数据变化，数据一更新就重新加载
export default {
  name: "PublicFactorMind",
  components: { IsChangeConfirm, DialogTPList, Shortcuts },
  data() {
    return {
      mindFlag: true,
      projectId: null,
      currentNode: null,
      sceneId: null,
      sceneViewName: "思维脑图",
      initJsonD: { root: { data: {}, children: [] } },
      initJsonD1: {
        root: {
          data: {
            text: "百度产品",
            id: "0"
          },
          children: [
            { data: { text: "新闻", id: "1", resource: ["自定义标签"] } },
            { data: { text: "网页", id: "2", priority: 1 } },
            { data: { text: "地图", id: "8", priority: 3 } }
          ]
        }
      }
    };
  },
  computed: {
    // 引用模块
    // ...mapState('caseEditorStore', [
    //     'callbackQueue',
    //     'working'
    // ]),
    // 引用的全局store
    // ...mapState(["caseEditorStore"]),
    // ...mapGetters({
    //   minder: "getMinder",
    //   editor: "getEditor",
    //   config: "config",
    //   view: "getView",
    //   count: "count"
    // }),
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.saveMind(false);
    this.$nextTick(() => {
      next();
    });
  },
  watch: {
    $route(to, from) {
      this.initLocalStorage();
    }
  },
  activated() {
    this.sceneId = this.$route.params.sceneId;
    this.projectId = this.$route.query.projectId;
    this.sceneViewName = this.$route.query.sceneName;

    this.getinitJOSN();
    // this.reload();
    this.$nextTick(() => {});
  },
  created() {},
  mounted() {
    // window.localStorage.mindText = JSON.stringify(editor.minder.exportJson());
    // if (window.localStorage.mindText) {
    //   editor.minder.importJson(JSON.parse(window.localStorage.mindText));
    // }
    let _this = this;
    let editor = window.editor;
    if (editor) {
      editor.minder.on("contentchange", function(e) {
        let dragtreeTemp = localStorage.getItem("dragtree");
        let execCommandNameTemp = localStorage.getItem("execCommandName");
        let currentNode = minder.getSelectedNode();
        let currentNodes = minder.getSelectedNodes();
        console.log(
          "currentNode==",
          currentNode,
          currentNodes,
          dragtreeTemp,
          execCommandNameTemp
        );

        //  展示/关闭节点,页面拖拽未改变位置 不调接口
        if (
          (dragtreeTemp == "dragfinish" || dragtreeTemp == "dragmode") &&
          execCommandNameTemp == "text"
        ) {
          return;
        }

        if (dragtreeTemp == "movetoparent" || dragtreeTemp == "arrange") {
          // 拖动到某父节点、拖动兄弟节点
          _this.handleDragSceneNode(currentNode, execCommandNameTemp);
        }

        if (execCommandNameTemp == "inputChange") {
          // 编辑节点
          localStorage.setItem("execCommandName", "text"); //获取变化值之后恢复原值(页面原始渲染状态),便于判断拖拽的情形
          if (!currentNode.parent) {
            _this.handleEditSceneNode(currentNode);
          } else {
            _this.handleEditSceneNode();
          }
        } else if (execCommandNameTemp == "priority") {
          localStorage.setItem("execCommandName", "text");
          // 点击标签
          if (currentNodes.length > 1) {
            // 批量操作
            _this.handleEditBatch(currentNodes);
          } else if (currentNodes.length == 1) {
            _this.handleEditSceneNode(currentNode);
          }
        } else if (execCommandNameTemp == "appendchildnode") {
          localStorage.setItem("execCommandName", "text");
          // 添加子节点
          _this.handleAddSceneNode(currentNode);
        } else if (execCommandNameTemp == "appendsiblingnode") {
          localStorage.setItem("execCommandName", "text");
          // 添加同级节点
          _this.handleAddNeighbor(currentNode);
        } else if (execCommandNameTemp == "removenode") {
          // 删除节点---在button处理-忽略
          localStorage.setItem("execCommandName", "text");
        } else if (
          execCommandNameTemp == "movetoparent" ||
          execCommandNameTemp == "arrange"
        ) {
          localStorage.setItem("execCommandName", "text");
          // 拖动到某父节点、拖动兄弟节点--会触发2次
          // _this.handleDragSceneNode(currentNode, execCommandNameTemp);
        } else if (
          execCommandNameTemp == "arrangeup" ||
          execCommandNameTemp == "arrangedown"
        ) {
          localStorage.setItem("execCommandName", "text");
          // 上移/下移
          _this.handleArrangeUpOrDownNode(currentNode, execCommandNameTemp);
        } else if (execCommandNameTemp == "paste") {
          localStorage.setItem("execCommandName", "text");
          // 粘贴节点---在button处理-忽略
        }
      });
    }

    // 监听快捷键事件，未放在脑图源码内定义
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.keyCode === 81) {
        //ctrl+q
        let currentNode = minder.getSelectedNode();
        if (currentNode && currentNode.data.priority == 2) {
          this.$refs.dialogTPList.open(currentNode);
        }
      }
    });
    // 监听快捷键事件，未放在脑图源码内定义
    document.addEventListener("mousedown", e => {
      // if(!minder.getSelectedNode()){
      //   minder.execCommand("hand");
      // }
    });
    document.addEventListener("mouseup", e => {
      // minder.execCommand("hand");
    });
  },
  methods: {
    //获取根
    promiseGetRoot() {
      return new Promise((resolve, reject) => {
        let url = `/ylgl/test/scene/get/${this.sceneId}`;
        this.$post(url, {})
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //获取节点
    promiseGetNode() {
      return new Promise((resolve, reject) => {
        let url = `/ylgl/test/SceneNode/node/getTree/${this.sceneId}`;
        this.$post(url, {})
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    getinitJOSN0() {
      let _this = this;
      Promise.all([this.promiseGetRoot(), this.promiseGetNode()]).then(res => {
        if (res[0].status == 200 && res[0].data.success) {
          _this.$set(res[0].data.data, "text", res[0].data.data.name);
          _this.initJsonD.root.data = res[0].data.data;
        }
        if (res[1].status == 200 && res[1].data.success) {
          _this.initJsonD.root.children = [...res[1].data.data];
        }

        window.minder.importJson(_this.initJson);
        // console.log(
        //   "_this.initJsonD===",
        //   _this.initJsonD,
        //   window.minder.exportJson(),
        //   this.$refs.minderEditor.getJsonData()
        // );

        //需要重新渲染脑图--刷新后最为最新的视图
        let jsonImport = window.minder.exportJson();
        _this.setJsonImport(jsonImport);
        _this.$nextTick(() => {
          _this.reload();
        });
      });
    },

    // 新建 聚焦输入框
    setNewForcs(minder) {
      function afterAppend() {
        window.editor.editText();
        minder.off("layoutallfinish", afterAppend);
      }
      minder.on("layoutallfinish", afterAppend);
    },
    // header 插入同级
    handleAppendSiblingNode() {
      minder.execCommand("AppendSiblingNode", "分支主题");
      this.setNewForcs(minder);
    },
    // header 插入子级
    handleAppendChildNode() {
      minder.execCommand("AppendChildNode", "分支主题");
      this.setNewForcs(minder);
    },
    // header 删除
    handleDel() {
      let currentNode = minder.getSelectedNode();
      if (!currentNode.parent) {
        this.$message.warning("不允许删除根节点");
      } else {
        let currentNodes = minder.getSelectedNodes();
        if (currentNodes.length > 1) {
          this.handleDeleteBatch(currentNodes);
        } else if (currentNodes.length == 1) {
          this.handleDeleteSceneNode(currentNode);
        }
        minder.execCommand("RemoveNode");
        window.editor.fsm.jump("normal", "command-executed");
      }
    },
    //获取当前节点
    getinitJOSN() {
      let _this = this;
      let url = `/ylgl/test/SceneNode/node/getTree/${this.sceneId}`;
      this.$post(url, {}).then(res => {
        if (res.status == 200 && res.data.success) {
          let treeNodeAll = res.data.data;
          // 根节点
          let rootTemp = {
            pageId: null,
            caseNum: treeNodeAll.caseNum,
            id: treeNodeAll.id,
            type: treeNodeAll.type,
            priority: treeNodeAll.type
              ? _this.handlePriortyStringToNum(treeNodeAll.type)
              : null,
            level: treeNodeAll.level,
            name: treeNodeAll.name,
            text: treeNodeAll.name,
            parentId: treeNodeAll.parentId,
            sceneId: treeNodeAll.sceneId,
            creator: treeNodeAll.creator,
            creatorId: treeNodeAll.creatorId,
            updater: treeNodeAll.updater,
            updaterId: treeNodeAll.updaterId
          };
          // _this.$set(res.data.data, "text", res.data.data.name);
          let nodeListchild = treeNodeAll.children || [];

          this.getAllchildNode(nodeListchild);
          this.$nextTick(() => {
            this.initJsonD = {
              root: { data: rootTemp, children: nodeListchild }
            };
            // console.log("this.initJsonD===", this.initJsonD);
          });
        } else {
          this.initJsonD = { root: { data: {}, children: [] } };
          this.$message.error(res.data.message);
        }
      });
    },

    // 遍历子节点
    getAllchildNode(nodeListchild) {
      if (nodeListchild.length > 0) {
        nodeListchild.forEach((item, index) => {
          item.text = item.name;
          let nodeTemp = {
            pageId: null,
            caseNum: item.caseNum,
            type: item.type,
            priority: item.type
              ? this.handlePriortyStringToNum(item.type)
              : null,
            resource:
              item.type && item.type == "TP" ? ["(" + item.caseNum + ")"] : [],
            id: item.id,
            level: item.level,
            name: item.name,
            text: item.name,
            parentId: item.parentId,
            sceneId: item.sceneId,
            creator: item.creator,
            pos: item.pos,
            creatorId: item.creatorId,
            createTime: item.createTime,
            updateTime: item.updateTime,
            updater: item.updater,
            updaterId: item.updaterId
          };
          nodeListchild[index] = { data: nodeTemp, children: item.children };

          if (item.children.length > 0) {
            this.getAllchildNode(item.children);
          }
        });
      }
    },

    // 重新加载
    reload() {
      let _this = this;
      _this.mindFlag = false;
      _this.$nextTick(() => {
        _this.mindFlag = true;
      });
    },
    setJsonImport(data) {
      // root不允许编辑
      if (data.root && data.root.data) {
        if (data.root.data.text === "root") {
          data.root.data.disable = true;
        }
      }
      this.initJsonD = data;
    },
    // 示例方法，实际可根据需要绑定到其他元素事件中，比如 v-on:click="logCurrentData"
    logCurrentData: function(event) {
      console.log(
        "编辑器中的最新用例内容：",
        this.$refs.minderEditor.getJsonData()
      );
    },
    listenBeforeExecCommand(callback) {
      let minder = window.minder;
      minder.on("beforeExecCommand ", function(even) {
        if (callback) {
          callback(even);
        }
      });
    },
    //添加-新建用例操作
    afterMountEditor() {
      let hotboxEditor = window.editor.hotbox;
      let main = hotboxEditor.state("main");
      this.setInitHoxBox(main);
      this.addIssueHotBox(this, main);
    },
    addIssueHotBox(_this, main) {
      main.button({
        position: "ring",
        label: "新建用例",
        key: "Ctrl+q",
        action: function() {
          let currentNode = minder.getSelectedNode();
          _this.currentNode = currentNode;
          _this.$refs.dialogTPList.open(currentNode);
        },
        enable: function() {
          let currentNode = minder.getSelectedNode(); //获取当前点击的node
          //如果是 TP 则可新建用例，其他都不给建
          return currentNode.data.priority && currentNode.data.priority == 2
            ? true
            : false;
        },
        beforeShow: function() {}
      });
    },
    setInitHoxBox(main) {
      let _this = this;
      var runtime = window.editor;
      var fsm = runtime.fsm;
      var buttons = [
        "新增子节点:Tab|Insert:AppendChildNode",
        "新增邻节点:Enter:AppendSiblingNode",
        "删除节点:Delete|Backspace:RemoveNode",
        "复制节点:Ctrl+c:Copy",
        "粘贴节点:Ctrl+v:Paste"
      ];

      // "上移节点:Alt+up:ArrangeUp",
      // "下移节点:Alt+down:ArrangeDown"
      // "上级:Shift+Tab|Shift+Insert:AppendParentNode",
      var AppendLock = 0;

      buttons.forEach(function(button) {
        var parts = button.split(":");
        var label = parts.shift();
        var key = parts.shift();
        var command = parts.shift();
        main.button({
          position: "ring",
          label: label,
          key: key,
          action: function() {
            let currentNode = minder.getSelectedNode();
            //新增子/邻
            if (command.indexOf("Append") === 0) {
              AppendLock++;
              // currentNode.renderTree();   currentNode.render()
              minder.execCommand(command, "分支主题");
              function afterAppend() {
                if (!--AppendLock) {
                  runtime.editText();
                }
                minder.off("layoutallfinish", afterAppend);
              }
              minder.on("layoutallfinish", afterAppend);
            } else if (command.indexOf("Remove") == 0) {
              // 删除
              let currentNodes = minder.getSelectedNodes();
              if (currentNodes.length > 1) {
                _this.handleDeleteBatch(currentNodes);
              } else if (currentNodes.length == 1) {
                _this.handleDeleteSceneNode(currentNode);
              }
              minder.execCommand(command);
              fsm.jump("normal", "command-executed");
            } else if (command.indexOf("Paste") == 0) {
              // 复制粘贴后
              console.log("command-===222", currentNode); //粘贴到currentNode节点下
              minder.execCommand(command);
              _this.handleCopyPaste(currentNode);
              fsm.jump("normal", "command-executed");
            } else {
              minder.execCommand(command);
              fsm.jump("normal", "command-executed");
            }
          },
          enable: function() {
            return minder.queryCommandState(command) != -1;
          }
        });
      });
    },
    //点击菜单栏上的标签即触发该事件
    changeNodeLabel(currentNodeTemp) {
      // console.log("currentNodeTemp--", currentNodeTemp);
    },
    getSuccessMessage(titleMessage) {
      this.$notify({
        title: titleMessage,
        message: "",
        type: "success",
        duration: 2000
      });
    },
    //新增场景节点--调用稍晚，拿新增的nodeId(通过监听contentchange事件)
    handleAddSceneNode(currentNode) {
      let param = {
        id: currentNode.data.id,
        name: "分支主题", //当新增之后未触发编辑直接拖拽时，会造成name未填充，所以提前填充
        parentId: currentNode.parent.data.id,
        sceneId: this.sceneId
      };
      this.$post(`/ylgl/test/SceneNode/node/add`, param).then(res => {
        // console.log("res---", res, window.minder.exportJson(), this.initJsonD);
        if (res.data.success) {
          this.getSuccessMessage("新增成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    // 遍历寻找新增的node===找其父节点
    handleAddNode(nodeListForAdd, parentIdTemp, newNode, parseFrontLocalCopy) {
      if (nodeListForAdd.length > 0) {
        nodeListForAdd.forEach((item, index) => {
          // console.log("item.data.id---", item.data.id, parentIdTemp);
          if (item.data.id == parentIdTemp) {
            // 不要直接替换，要留住页面临时生成的id号（当对新节点进行增删改操作时，方便寻找）
            let chileLen = item.children.length;
            item.children[chileLen - 1].data = {
              newId: newNode.id,
              id: item.children[chileLen - 1].data.id,
              text: item.children[chileLen - 1].data.text,
              created: item.children[chileLen - 1].data.created
            };
            // 更新脑图存档
            localStorage.setItem(
              "mindText",
              JSON.stringify(parseFrontLocalCopy)
            );
            return;
          }
          if (item.children.length > 0) {
            this.handleAddNode(
              item.children,
              parentIdTemp,
              newNode,
              parseFrontLocalCopy
            );
          }
        });
      }
    },
    // 当为临时节点时去存档中找newId
    getNewIdLocal(chilrenFrontLocal, idFront, newIdtemp) {
      if (chilrenFrontLocal.length > 0) {
        chilrenFrontLocal.forEach((item, index) => {
          // console.log("getNewIdLocal===", item, item.data.id, idFront);
          if (item.data.id == idFront) {
            newIdtemp = item.data.newId;
            return;
          }
          if (item.children.length > 0) {
            this.getNewIdLocal(item.children, idFront, newIdtemp);
          }
        });
      }
    },
    // 增加同级节点
    handleAddNeighbor(currentNode) {
      let childAllNeibor = currentNode.parent.children;
      let currentNerobeId = childAllNeibor.findIndex(
        item => item.data.id == currentNode.data.id
      );
      let newNodeIdTemp = currentNerobeId - 1;
      let param = {
        newNodeId: currentNode.data.id,
        newNodeName: "分支主题",
        nodeId: childAllNeibor[newNodeIdTemp].data.id
      };
      this.$post(`/ylgl/test/SceneNode/node/addNeighbor`, param).then(res => {
        if (res.data.success) {
          this.getSuccessMessage("新增成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    // 标签字符串与数字相互转换
    handlePriortyStringToNum(string) {
      if (string == "SC") {
        return 1;
      } else if (string == "TP") {
        return 2;
      } else if (string == "CO") {
        return 3;
      } else if (string == "ST") {
        return 4;
      } else if (string == "EX") {
        return 5;
      }
    },
    // 标签字符串与数字相互转换
    handlePriortyNumToString(num) {
      if (num == 1) {
        return "SC";
      } else if (num == 2) {
        return "TP";
      } else if (num == 3) {
        return "CO";
      } else if (num == 4) {
        return "ST";
      } else if (num == 5) {
        return "EX";
      }
    },
    // 批量修改类型
    handleEditBatch(currentNodes) {
      let nodeIdstemp = currentNodes.map(item => item.data.id);
      let prioritytemp = currentNodes[0].data.priority;
      let param = {
        node: {
          type: prioritytemp ? this.handlePriortyNumToString(prioritytemp) : ""
        },
        nodeIds: nodeIdstemp
      };
      this.$post(`/ylgl/test/SceneNode/node/batchEdit`, param).then(res => {
        if (res.data.success) {
          this.getSuccessMessage("编辑成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    // 批量删除
    handleDeleteBatch(currentNodes) {
      let nodeIdstemp = currentNodes.map(item => item.data.id);
      let param = {
        node: {},
        nodeIds: nodeIdstemp
      };
      this.$post(`/ylgl/test/SceneNode/node/batchDelete`, param).then(res => {
        if (res.data.success) {
          this.getSuccessMessage("删除成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    //修改场景节点--单条
    handleEditSceneNode(currentNode) {
      let param = {};
      if (currentNode) {
        //加标签
        param = {
          id: currentNode.data.id,
          name: currentNode.data.text,
          type: currentNode.data.priority
            ? this.handlePriortyNumToString(currentNode.data.priority)
            : ""
        };
      } else {
        //编辑后 回车 失焦/无失焦直接拖拽
        let currentemp = JSON.parse(localStorage.getItem("inputChangeNode"));
        param = {
          id: currentemp.current.id,
          name: currentemp.current.text,
          type: currentemp.current.priority
            ? this.handlePriortyNumToString(currentemp.current.priority)
            : ""
        };
      }
      this.$post(`/ylgl/test/SceneNode/node/edit`, param).then(res => {
        if (res.data.success) {
          this.getSuccessMessage("编辑成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },

    // 删除场景节点
    handleDeleteSceneNode(currentNode) {
      let nodeIdTemp = currentNode.data.id;
      this.$post(`/ylgl/test/SceneNode/node/delete/${nodeIdTemp}`, {}).then(
        res => {
          if (res.data.success) {
            this.getSuccessMessage("删除成功");
          } else {
            this.$message.warning(res.data.message);
          }
        }
      );
    },
    // 拖拽节点
    handleDragSceneNode(currentNode, execCommandNameTemp) {
      let param = {
        nodeId: currentNode.data.id,
        parentId: currentNode.parent.data.id
      };
      if (execCommandNameTemp == "movetoparent") {
        param.order = null;
      }
      if (execCommandNameTemp == "arrange") {
        let orderTemp = null;
        currentNode.parent.children.forEach((item, index) => {
          if (item.data.id == currentNode.data.id) {
            orderTemp = index;
            return;
          }
        });
        param.order = orderTemp;
      }
      this.postDragData(param);
    },
    // 上移/下移
    handleArrangeUpOrDownNode(currentNode, execCommandNameTemp) {
      let childAllNeibor = currentNode.parent.children;
      if (childAllNeibor.length < 2) {
        return;
      }
      // 监听是在已经移动结束操作后触发，此时的顺序就是已经移动后的顺序
      let currentNerobeId = childAllNeibor.findIndex(
        item => item.data.id == currentNode.data.id
      );
      let param = {
        nodeId: currentNode.data.id,
        parentId: currentNode.parent.data.id,
        order: currentNerobeId
      };
      this.postDragData(param);
    },
    // 调用拖拽接口
    postDragData(param) {
      this.$post(`/ylgl/test/SceneNode/node/drag`, param).then(res => {
        if (res.data.success) {
          this.getSuccessMessage("拖拽成功");
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    //返回上一页
    cancel() {
      this.initLocalStorage();
      this.$router.push(`/track/factor?projectId=${this.projectId}`);
    },

    // 退出脑图，则清空localStorage
    initLocalStorage() {
      localStorage.setItem("mindText", null);
      localStorage.setItem("inputChangeNode", null);
      localStorage.setItem("execCommandName", null);
    },
    // 粘贴节点
    handleCopyPaste(currentNode) {
      console.log("currentNode--", currentNode);
      // currentNode为粘贴在哪个节点下； currentNode.children[currentNode.children.length-1] 粘贴为目标节点的最后一个子节点
      let _this = this;
      let param = {};

      let nodeListchild =
        currentNode.children[currentNode.children.length - 1].children || [];
      console.log("param===nodeListchildnodeListchild", nodeListchild);
      let newChildJson = []; //所有的子节点的--json格式 //不能像全量保存那样直接复制节点--会造成改变节点类型
      this.getAllchildNodeReverse(nodeListchild, newChildJson);
      console.log("newChildJson---", newChildJson);

      let firstChildData =
        currentNode.children[currentNode.children.length - 1].data;
      let paramNode = {
        caseNum: 0,
        id: firstChildData.id,
        type: firstChildData.type,
        priority: firstChildData.type
          ? _this.handlePriortyNumToString(firstChildData.type)
          : null,
        level: firstChildData.level,
        name: firstChildData.text,
        text: firstChildData.text,
        parentId: firstChildData.parentId,
        sceneId: firstChildData.sceneId,
        creator: firstChildData.creator,
        creatorId: firstChildData.creatorId,
        updater: firstChildData.updater,
        updaterId: firstChildData.updaterId,
        pageId: firstChildData.pageId,
        children: []
      };

      param = {
        ...paramNode,
        children: newChildJson
      };
      console.log("param===paste1234567", param);
      this.handleCopyOk(param);
    },
    handleCopyOk(param) {
      this.$nextTick(() => {
        this.$post(`/ylgl/test/SceneNode/node/copyNodeTree`, param).then(
          res => {
            if (res && res.data) {
              if (res.data.success) {
                this.getSuccessMessage("粘贴成功");
              } else {
                this.$message.warning(res.data.message);
              }
            }
          }
        );
      });
    },
    // 全量保存脑图
    saveMind(flag) {
      let allMind = editor.minder.exportJson();
      let param = {};

      let treeNodeAll = allMind.root.data;
      // 根节点
      let rootTemp = {
        pageId: null,
        caseNum: treeNodeAll.caseNum,
        id: treeNodeAll.id,
        type: treeNodeAll.type,
        priority: treeNodeAll.type
          ? _this.handlePriortyNumToString(treeNodeAll.type)
          : null,
        level: treeNodeAll.level,
        name: treeNodeAll.text,
        text: treeNodeAll.text,
        parentId: treeNodeAll.parentId,
        sceneId: treeNodeAll.sceneId,
        creator: treeNodeAll.creator,
        creatorId: treeNodeAll.creatorId,
        updater: treeNodeAll.updater,
        updaterId: treeNodeAll.updaterId
      };

      let nodeListchild = allMind.root.children || [];

      this.getAllchildNodeReverse(nodeListchild);
      this.$nextTick(() => {
        param = {
          ...rootTemp,
          children: nodeListchild
        };

        this.$post(
          `/ylgl/test/SceneNode/node/saveAll/${this.sceneId}`,
          param
        ).then(res => {
          if (res.data.success) {
            if (flag) {
              this.getSuccessMessage("脑图保存成功");
            }
          } else {
            this.$message.warning(res.data.message);
          }
        });
      });
    },

    // 遍历子节点--反向处理数据结构,传输给后台的数据结构
    getAllchildNodeReverse(nodeListchild, newChildJson) {
      if (nodeListchild.length > 0) {
        nodeListchild.forEach((item, index) => {
          let nodeTemp = {
            ...item.data,
            children: (item.children && item.children.data) || []
          };
          nodeTemp.name = nodeTemp.text;
          if (newChildJson) {
            // 粘贴时数据处理
            newChildJson[index] = nodeTemp;
          } else {
            // 全量保存时数据处理
            nodeListchild[index] = nodeTemp;
          }

          if (item.children.length > 0) {
            this.getAllchildNodeReverse(item.children, newChildJson);
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.backBtn {
  padding: 0 12px;
  position: fixed;
  right: 10px;
  top: 1%;
  z-index: 1000;
  border-radius: 2px;
  opacity: 0.8;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  display: flex;
}
.saveBtn {
  padding: 0 12px;
  position: fixed;
  right: 10px;
  top: 73px;
  z-index: 1000;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  display: flex;
}
.toolBar {
  padding: 0 12px;
  display: flex;
  position: fixed;
  left: 120px;
  bottom: 15px;
  /* right: 10px;
  top: 6.5%; */
  z-index: 1000;
  font-size: 14px;
  text-align: center;
  height: 32px;
  line-height: 32px;
  background: #ffffff;
  box-shadow: 0 1px 4px #252b3a1f;
  border-radius: 4px;
  cursor: pointer;
  color: #000000a6;
}
.toolbar:hover {
  background: #ddd;
}
.titleNode {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 26px 0 20px;
}
.listNode {
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.name {
  color: #333;
}
.value {
  color: #909090;
  margin-left: auto;
}
</style>
