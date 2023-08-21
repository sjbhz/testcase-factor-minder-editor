<template lang="html">
<div class="menu-container">
  <save-box v-if="allowEditNode" @saveMind="$emit('saveMind')"></save-box>
<!--  撤销回退、重做-->
  <back-and-right></back-and-right>

  <expand></expand>
  <selection></selection>
  <insert-box v-if="allowEditNode"></insert-box>
  <move-box v-if="allowEditNode"></move-box>
  <edit-del v-if="allowEditNode"></edit-del>
  <!--  查询、过滤-->
  <search></search>
  <!--    超链接-->
  <hyberlink v-if="allowEditNode"></hyberlink>
  <node-box v-if="allowEditNode"></node-box>
  <!-- <sequence-box v-if="allowEditPriority"></sequence-box> -->
  <!-- <progress-box></progress-box> -->
  <!--  自定义标签-->
  <!-- <resource-edit v-if="allowEditLabel"></resource-edit> -->
  <!--测试结果登记-->
  <!-- <result-box v-if="allowEditResult"></result-box> -->
  <!-- 添加测试点TP等标签 -->
  <stage-box v-if="allowEditPriority" @changeNodeLabel="(currentNodeTemp)=>$emit('changeNodeLabel',currentNodeTemp)"></stage-box>

</div>
</template>

<script>
import saveBox from "./saveBox";
import insertBox from "./insertBox";
import moveBox from "./moveBox";
import editDel from "./editDel";
import sequenceBox from "./sequenceBox";
import stageBox from "./stageBox";
import progressBox from "./progressBox";
import expand from "./expand";
import selection from "./selection";
import NodeBox from "./noteBox";
import resourceEdit from "./resourceEdit";
import Search from "./search/search";
import hyberlink from "./hyberlink";
import backAndRight from "./backAndRight";
import resultBox from "./resultBox";

import { mapGetters } from "vuex";

export default {
  name: "editMenu",
  components: {
    saveBox,
    Search,
    NodeBox,
    insertBox,
    moveBox,
    editDel,
    sequenceBox,
    stageBox,
    // progressBox,
    expand,
    selection,
    resourceEdit,
    hyberlink,
    backAndRight,
    resultBox
  },
  computed: {
    ...mapGetters("caseEditorStore", {
      count: "count",
      config: "config"
    }),
    allowEditPriority() {
      return this.config.allowEditPriority;
    },
    allowEditLabel() {
      return this.config.allowEditLabel;
    },
    allowEditResult() {
      return this.config.allowEditResult;
    },
    allowEditNode() {
      return this.config.allowEditNode;
    }
  }
};
</script>
