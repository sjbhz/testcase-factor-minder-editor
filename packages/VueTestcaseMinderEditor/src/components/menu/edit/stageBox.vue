<template lang="">
  <div :disabled="commandDisabled">
    <span v-for="(item, index) in items" class="stage-group">
      <span class="part-top">
        <el-button
          class="stage-btn"
          size="mini"
          @click="execCommand(index)"
          :title="title(item,index)"
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

/*
  Desc:由 priority改造
  Date:2023-08-17
*/

export default {
  name: "stageBox",
  data() {
    return {
      items: [
        { id: "0", value: " X", label: " 移 除", color: "#a3d980" },
        { id: "1", value: "SC", label: " 场 景", color: "#50d4ab" },
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
          this.commandValue = minder.queryCommandValue("priority");
        });
      // console.info(minder)
      return (
        minder.queryCommandState && minder.queryCommandState("priority") === -1
      );
    }
  },
  methods: {
    execCommand(index) {
      console.log("this.minder--", this.minder);
      this.commandDisabled || this.minder.execCommand("priority", index);
    },

    classArray(index) {
      var isActive =
        this.minder.queryCommandValue &&
        this.minder.queryCommandValue("priority") == index;
      var sequence = "sequence-" + index;

      // 用数组返回多个class
      var arr = [
        {
          active: isActive
        },
        sequence
      ];
      return arr;
    },

    //鼠标移上去显示
    title(item, index) {
      switch (index) {
        case 0:
          return "移除标签";
        default:
          return item.label;
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
  margin-top: 5px;
}

.stage-btn {
  /* color: "#fff"; */
  margin-left: 5px;
  line-height: 5px;
  margin-top: 8px;
}
</style>
