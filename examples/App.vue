<template>
  <div id="app">
    <VueTestcaseMinderEditor
      @afterMountEditor="afterMountEditor"
      @changeNodeLabel="changeNodeLabel"
      @saveMind="saveMind"
      @handleAppendSiblingNode="handleAppendSiblingNode"
      @handleAppendChildNode="handleAppendChildNode"
      @handleDel="handleDel"
      :initJson="initJson"
      ref="minderEditor"
      :sceneViewName="sceneViewName"
      :showHeaderFlag="showHeaderFlag"
      :showNavigatorFlag="showNavigatorFlag"
      :isNavOpen="isNavOpenSmall"
      :allowEditPriority="editMode"
      :allowEditLabel="editMode"
      :allowEditResult="editMode"
      :allowEditNode="editMode"
    ></VueTestcaseMinderEditor>
    <button @click="clicUP">放大</button>
    <button>缩小</button>
    <button>拖拽</button>
    <button>定位根节点</button>
    <button>导航器</button>
    <!-- <button :style="{left: '0px'}" v-on:click="logCurrentData">打印当前用例 json 至 console 日志</button>
    <button :style="{left: '0px'}" v-on:click="toggleEditMode">{{ buttonText }}</button>-->
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      initJson: {
        root: {
          data: {
            text: "百度产品1",
            id: "0",
            parentId: "",
            caseNum: 0
          },
          children: [
            {
              data: {
                text: "新闻",
                id: "1",
                priority: 2,
                resource: ["(3)"],
                parentId: "0",
                caseNum: 0
              },
              children: [
                {
                  data: {
                    text: "网页2",
                    id: "2",
                    priority: 1,
                    resource: ["4"],
                    parentId: "1",
                    caseNum: 4
                  }
                }
              ]
            },
            {
              data: {
                text: "网页",
                id: "2",
                priority: 1,
                resource: ["4"],
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "贴吧",
                id: "3",
                priority: 2,
                parentId: "0",
                caseNum: 0
              },
              children: [
                {
                  data: {
                    text: "ccccc",
                    id: "4",
                    priority: 2,
                    parentId: "0",
                    caseNum: 0
                  }
                }
              ]
            },
            {
              data: {
                text: "知道",
                id: "4",
                priority: 2,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "音乐",
                id: "5",
                priority: 3,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "图片",
                id: "6",
                priority: 4,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "视频",
                id: "7",
                priority: 3,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "地图",
                id: "8",
                priority: 5,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "百科",
                id: "9",
                priority: 3,
                parentId: "0",
                caseNum: 0
              }
            },
            {
              data: {
                text: "更多",
                id: "10",
                hyperlink: "http://www.baidu.com/more",
                parentId: "0",
                caseNum: 0
              }
            }
          ]
        }
      },
      sceneViewName: "场景123",
      showHeaderFlag: true,
      showNavigatorFlag: true,
      isNavOpenSmall: false,
      editMode: true
    };
  },
  computed: {
    buttonText: function() {
      return this.editMode === false
        ? "进入编辑模式，允许修改脑图内容及登记结果"
        : "退出编辑模式";
    }
  },
  watch: {
    initJson: {
      handler(val, oldVal) {
        console.log("val---", val);
      },
      // immediate: true,
      deep: true
    }
  },
  mounted() {
    /*
      localStorage.getItem("inputChangeNode")  编辑节点时将当前节点缓存--- 兼容了鼠标直接点击画布，造成无节点选中
      localStorage.getItem("execCommandName")  操作类型
      minder.getSelectedNode() 当前节点
      _this.$refs.minderEditor.getJsonData().root 脑图所有数据
    */
    let editor = window.editor;
    editor.minder.on("contentchange", function(e) {
      let dragtreeTemp = localStorage.getItem("dragtree");
      let execCommandNameTemp = localStorage.getItem("execCommandName");
      let currentNode = minder.getSelectedNode();
      let currentNodes = minder.getSelectedNodes(); //选中多个nodes
      console.log("execCommandNameTemp---", dragtreeTemp, execCommandNameTemp);
      if (execCommandNameTemp == "inputChange") {
        // 编辑节点
        let currentNodeCorrect = localStorage.getItem("inputChangeNode"); // 编辑时的节点
        // console.log("currentNode----editText", currentNodeCorrect);
      } else if (execCommandNameTemp == "priority") {
        // 点击标签
      } else if (execCommandNameTemp == "appendchildnode") {
        // 添加子节点
        // _this.handleAddSceneNode(currentNode);
      } else if (execCommandNameTemp == "appendsiblingnode") {
        // 添加同级节点
        // _this.handleAddNeighbor(currentNode);
      } else if (execCommandNameTemp == "removenode") {
        // 删除节点---在button处理-忽略
      } else if (
        execCommandNameTemp == "movetoparent" ||
        execCommandNameTemp == "arrange"
      ) {
        // 拖动到某父节点、拖动兄弟节点-----会触发多次 ===》处理：监听dragtree？
        // _this.handleDragSceneNode(currentNode, execCommandNameTemp);
      } else if (
        execCommandNameTemp == "arrangeup" ||
        execCommandNameTemp == "arrangedown"
      ) {
        // 上移/下移
        // _this.handleArrangeUpOrDownNode(currentNode, execCommandNameTemp);
      } else if (execCommandNameTemp == "paste") {
        // console.log("pastepastepastepastepaste-----");
      }
    });
  },
  methods: {
    // 放大
    clicUP() {},
    setNewForcs(minder) {
      function afterAppend() {
        window.editor.editText();
        minder.off("layoutallfinish", afterAppend);
      }
      minder.on("layoutallfinish", afterAppend);
    },
    // 遍历子节点--反向处理数据结构,传输给后台的数据结构
    getAllchildNodeReverse(nodeListchild, newChildJson) {
      if (nodeListchild.length > 0) {
        nodeListchild.forEach((item, index) => {
          // let nodeTemp = item.getData();
          let nodeTemp = {
            ...item.data,
            children: item.children&&item.children.data || []
          };
          nodeTemp.name = nodeTemp.text;
          newChildJson[index] = nodeTemp;
          // nodeListchild[index] = nodeTemp;   //这样会直接修改minderNode的类型！！不能这么处理

          if (item.children.length > 0) {
            this.getAllchildNodeReverse(item.children,newChildJson);
          }
        });
      }
    },
    // 粘贴节点
    handleCopyPaste(currentNode) {
      // 标签字符串与数字相互转换
      console.log("currentNode--", currentNode);
      // currentNode为粘贴在哪个节点下； currentNode.children[currentNode.children.length-1] 粘贴为目标节点的最后一个子节点
      let nodeListchild =
        currentNode.children[currentNode.children.length - 1].children || [];
      let firstChildData = currentNode.children[currentNode.children.length - 1].data;
      let newChildJson = []; //所有的子节点的json格式
      this.getAllchildNodeReverse(nodeListchild, newChildJson);
      console.log("newChildJson---", newChildJson);

    },
    // header 插入同级
    handleAppendSiblingNode() {
      // AppendLock++;
      minder.execCommand("AppendSiblingNode", "分支主题");
      this.setNewForcs(minder);
    },
    // header 插入子级
    handleAppendChildNode() {
      minder.execCommand("AppendChildNode", "分支主题");
      function afterAppend() {
        window.editor.editText();
        minder.off("layoutallfinish", afterAppend);
      }
      minder.on("layoutallfinish", afterAppend);
    },
    // header 删除
    handleDel() {
      console.log("RemoveNode===", minder.getSelectedNode());
      minder.execCommand("RemoveNode");
      window.editor.fsm.jump("normal", "command-executed");
    },
    changeNodeLabel(currentNodeTemp) {
      console.log("currentNodeTemp--", currentNodeTemp);
    },
    // 2023-08-18 在加载完成后加入所需其他按钮，可在引用组建后，第三方直接调用即可
    afterMountEditor() {
      let hotboxEditor = window.editor.hotbox;
      console.log(window, this, window.minder, hotboxEditor);
      let main = hotboxEditor.state("main");

      this.setInitHoxBox(main);
      this.setAddtionalHotbox(main);
    },
    setInitHoxBox(main) {
      let _this = this;
      var runtime = window.editor;
      var fsm = runtime.fsm;
      var buttons = [
        "新增子节点:Tab|Insert:AppendChildNode",
        "新增邻节点:Enter:AppendSiblingNode",
        "删除节点:Delete|Backspace:RemoveNode",
        "复制节点:Ctrl+C:Copy",
        "粘贴节点:Ctrl+V:Paste"
      ];
      // "上级:Shift+Tab|Shift+Insert:AppendParentNode",
      // "下移节点:Alt+Down:ArrangeDown",
      // "上移节点:Alt+Up:ArrangeUp",
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
            if (command.indexOf("Append") === 0) {
              AppendLock++;
              minder.execCommand(command, "分支主题");

              function afterAppend() {
                if (!--AppendLock) {
                  runtime.editText();
                }
                minder.off("layoutallfinish", afterAppend);
              }
              minder.on("layoutallfinish", afterAppend);
            } else if (command.indexOf("Paste") == 0) {
              // 复制粘贴后
              console.log("command-===222", currentNode); //粘贴到currentNode节点下
              minder.execCommand(command);
              _this.handleCopyPaste(currentNode);
              fsm.jump("normal", "command-executed");
            } else {
              console.log("executed===", minder.getSelectedNode());
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
    //是否展开--暂时不用
    setExpandHotbox(main) {
      var runtime = window.editor;
      main.button({
        position: "ring",
        key: "/",
        action: function() {
          if (!minder.queryCommandState("expand")) {
            minder.execCommand("expand");
          } else if (!minder.queryCommandState("collapse")) {
            minder.execCommand("collapse");
          }
        },
        enable: function() {
          return (
            minder.queryCommandState("expand") != -1 ||
            minder.queryCommandState("collapse") != -1
          );
        },
        beforeShow: function() {
          if (!minder.queryCommandState("expand")) {
            // this.$button.children[0].innerHTML = "展开";
            runtime.$button.children[0].innerHTML = "展开";
          } else {
            // this.$button.children[0].innerHTML = "收起";
            runtime.$button.children[0].innerHTML = "收起";
          }
        }
      });
    },
    setAddtionalHotbox(main) {
      main.button({
        position: "ring",
        label: "新建用例",
        key: "R",
        action: function() {
          let currentNode = minder.getSelectedNode();
          console.log("currentNode---", currentNode);
        },
        enable: function() {
          let currentNode = minder.getSelectedNode(); //获取当前点击的node
          if (currentNode.data.priority && currentNode.data.priority == 2) {
            //如果是 TP 则可新建用例，其他都不给建
            return true;
          }
          return false;
        },
        beforeShow: function() {}
      });
    },
    setEditHotbox(main) {
      main.button({
        position: "ring",
        label: "编辑节点",
        key: "F2",
        action: function() {
          var runtime = window.editor;
          var fsm = runtime.fsm;
          var receiver = runtime.receiver;
          var receiverElement = receiver.element;
          let node = minder.getSelectedNode();
          console.log("currentNode---", currentNode);
          if (!node) {
            return;
          }
          var textContainer = receiverElement;
          receiverElement.innerText = "";
          if (node.getData("font-weight") === "bold") {
            var b = document.createElement("b");
            textContainer.appendChild(b);
            textContainer = b;
          }
          if (node.getData("font-style") === "italic") {
            var i = document.createElement("i");
            textContainer.appendChild(i);
            textContainer = i;
          }
          textContainer.innerText = minder.queryCommandValue("text");

          if (isGecko) {
            receiver.fixFFCaretDisappeared();
          }
          fsm.jump("input", "input-request");
          receiver.selectAll();
        },
        enable: function() {
          let currentNode = minder.getSelectedNode(); //获取当前点击的node
          if (currentNode.data.priority && currentNode.data.priority == 2) {
            //如果是 TP 则可新建用例，其他都不给建
            return true;
          }
          return false;
        },
        beforeShow: function() {}
      });
    },
    // 支持脑图保存按钮--暂时没用
    saveMind() {
      //获取当前页面脑图数据
      let caseJsonPage = this.$refs.minderEditor.getJsonData();
      console.log("caseJsonPage00----", caseJsonPage);
    },
    logCurrentData: function(event) {
      const caseJson = this.$refs.minderEditor.getJsonData();
      console.log("编辑器中的最新用例内容：", caseJson);
      const nodeDatas = {};
      this.checkJsonHasDuplicateId(caseJson.root, nodeDatas);
      // let hasDuplicateId = false;
      // Object.keys(nodeDatas).forEach(function(key) {
      //   const nodeData = nodeDatas[key];
      //   if (nodeData.length > 1) {
      //     console.log("重复id内容: ", nodeData);
      //     hasDuplicateId = true;
      //   }
      // });
      // if (hasDuplicateId) {
      //   this.$message.error("存在重复 id ，详情请看日志");
      // } else {
      //   this.$message("未发现重复 id ");
      // }
    },
    toggleEditMode: function(event) {
      this.editMode = !this.editMode;
    },
    checkJsonHasDuplicateId: function(jsonData, nodeDatas) {
      // console.log("checkJsonHasDuplicateId", jsonData, nodeDatas)
      let id;
      if (jsonData && jsonData.data && jsonData.data.id) {
        id = jsonData.data.id;
      }
      if (id !== undefined) {
        if (!Object.keys(nodeDatas).includes(id)) {
          nodeDatas[id] = [jsonData.data];
        } else {
          nodeDatas[id].push(jsonData.data);
        }
      }
      if (jsonData.children && jsonData.children.length > 0) {
        jsonData.children.forEach(element => {
          this.checkJsonHasDuplicateId(element, nodeDatas);
        });
      }
    }
  }
};
</script>
