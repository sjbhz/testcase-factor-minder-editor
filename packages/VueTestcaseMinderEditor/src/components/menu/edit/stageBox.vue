<template lang="">
  <div :disabled="commandDisabled">
    <span v-for="(item, index) in items" class="stage-group">
      <span class="part-top">
        <el-button
          class="stage-btn"
          size="mini"
          @click="execCommand(index)"
          :title="title(index)"
          :style="{ background: item.color,}"
          >
          <span style="color:#fff">{{ item.value }}</span>
        </el-button>
      </span>
      <span class="part-bottom">
        <span>{{ item.label }}</span>
      </span>
    </span>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "stageBox",
  data() {
    return {
      items: [
        { id: "0", value: "X", label: "移 除", color: "#a3d980" },
        { id: "1", value: "SC", label: "场 景", color: "#50d4ab" },
        { id: "2", value: "TP", label: "测试点", color: "#6cbfff" },
        { id: "3", value: "CO", label: "前提条件", color: "#fac20a" },
        { id: "4", value: "ST", label: "操作步骤", color: "#fa9841" },
        { id: "5", value: "EX", label: "预期结果", color: "#a97af8" }
      ]
    };
  },
  computed: {
    ...mapGetters("caseEditorStore", {
      minder: "getMinder"
    }),
    commandDisabled() {
      var minder = this.minder;
      minder.on &&
        minder.on("interactchange", function() {
          this.commandValue = minder.queryCommandValue("result");
        });
      return (
        minder.queryCommandState && minder.queryCommandState("result") === -1
      );
    }
  },
  methods: {
    execCommand(index) {
      // 兼容原来滴滴旧的登记方式，需要调整每个按钮对应的 command 里的值
      var indexTocommandValueMap = {
        0: 0, // 去掉结果
        1: 1, // 不通过
        2: 9, // 通过
        3: 5, // 阻塞
        4: 4 // 不执行
      };
      this.commandDisabled ||
        this.minder.execCommand(
          "result",
          indexTocommandValueMap[parseInt(index)]
        );
      console.log("this.minder--", this.minder);
    },
    isActive(index) {
      return (
        this.minder.queryCommandValue &&
        this.minder.queryCommandValue("result") == index
      );
    },
    title(index) {
      switch (index) {
        case 0:
          return "移除结果：Alt+D";
        case 1:
          return "成功：Alt+G";
        case 2:
          return "失败：Alt+F";
        case 3:
          return "跳过：Alt+S";
        default:
          return "";
      }
    }
  },
  created() {}
};
</script>
<style scoped>
.stage-group {
  display: inline-block;
  height: 100%;
  width: 60px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.part-top {
  display: inline-block;
  height: 50%;
}

.part-bottom {
  display: inline-block;
  width: 60px;
  margin-left: 5px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.stage-btn {
  /* color: "#fff"; */
  margin-left: 5px;
  line-height: 5px;
  margin-top: 5px;
}
</style>
