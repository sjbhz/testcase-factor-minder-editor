<template>
  <div id="app">
    <VueTestcaseMinderEditor
      @afterMountEditor="afterMountEditor"
      @saveMind="saveMind"
      :initJson="initJson"
      ref="minderEditor"
      :allowEditPriority="editMode"
      :allowEditLabel="editMode"
      :allowEditResult="editMode"
      :allowEditNode="editMode"
    ></VueTestcaseMinderEditor>

    <!-- <button :style="{left: '0px'}" v-on:click="logCurrentData">打印当前用例 json 至 console 日志</button>
    <button :style="{left: '0px'}" v-on:click="toggleEditMode">{{ buttonText }}</button> -->
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
            text: "百度产品",
            id: "0"
          },
          children: [
            { data: { text: "新闻", id: "1", resource: ["(3)"] } },
            { data: { text: "网页", id: "2", priority: 1, resource: ["4"] } },
            { data: { text: "贴吧", id: "3", priority: 2 } },
            { data: { text: "知道", id: "4", priority: 2 } },
            { data: { text: "音乐", id: "5", priority: 3 } },
            { data: { text: "图片", id: "6", priority: 4 } },
            { data: { text: "视频", id: "7", priority: 3 } },
            { data: { text: "地图", id: "8", priority: 5 } },
            { data: { text: "百科", id: "9", priority: 3 } },
            {
              data: {
                text: "更多",
                id: "10",
                hyperlink: "http://www.baidu.com/more"
              }
            }
          ]
        }
      },
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
      console.log(
        "contentchange===",
        localStorage.getItem("execCommandName"),
        e,
        minder.getSelectedNode()
      );
    });
  },
  methods: {
    // 2023-08-18 在加载完成后加入所需其他按钮，可在引用组建后，第三方直接调用即可
    afterMountEditor() {
      let hotboxEditor = window.editor.hotbox;
      console.log(
        window,
        this,
        window.minder,
        hotboxEditor
      );
      let main = hotboxEditor.state("main");

      this.setInitHoxBox(main);
      this.setAddtionalHotbox(main);
    },
    setInitHoxBox(main) {
      var runtime = window.editor
      var fsm = runtime.fsm;
      var buttons = [
        "新增子节点:Tab|Insert:AppendChildNode",
        "新增邻节点:Enter:AppendSiblingNode",
        "删除节点:Delete|Backspace:RemoveNode"
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
    //是否展开--暂时不用
    setExpandHotbox(main){
      var runtime = window.editor
      main.button({
        position: "ring",
        key: "/",
        action: function () {
          if (!minder.queryCommandState("expand")) {
            minder.execCommand("expand");
          } else if (!minder.queryCommandState("collapse")) {
            minder.execCommand("collapse");
          }
        },
        enable: function () {
          return (
            minder.queryCommandState("expand") != -1 ||
            minder.queryCommandState("collapse") != -1
          );
        },
        beforeShow: function () {
          if (!minder.queryCommandState("expand")) {
            // this.$button.children[0].innerHTML = "展开";
            runtime.$button.children[0].innerHTML = "展开";
          } else {
            // this.$button.children[0].innerHTML = "收起";
            runtime.$button.children[0].innerHTML = "收起";
          }
        },
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
