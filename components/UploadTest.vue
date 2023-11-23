<template>
  <div class="p-6">
    <div class="file-input-container" @dragover.prevent @drop="handleDrop">
      <input
        class="mb-3"
        type="file"
        name="file"
        ref="inputFile"
        multiple
        hidden
        @change="handleChangeFile"
      />
      <button @click="handleOpen('file')" class="bg-slate-300 rounded p-4 m-2">
        Upload file
      </button>

      <input
        class="mb-3"
        type="file"
        name="file"
        ref="inputFolder"
        webkitdirectory
        multiple
        hidden
        @change="handleChangeFolder"
      />
      <button
        @click="handleOpen('folder')"
        class="bg-slate-300 rounded p-4 m-2"
      >
        Upload folder
      </button>
    </div>
    <ul class="border border-indigo-600 my-6">
      <li
        v-for="(item, index) in files"
        :key="index"
        class="flex item-center m-2"
      >
        <div>
          <img
            v-if="item.length > 0"
            src="../static/folder.png"
            alt=""
            class="w-[50px] h-[50px]"
          />
          <img v-else :src="item.preview" class="w-[50px] h-[50px]" />
        </div>
        <div class="w-[90%] p-2">
          <div class="text-lg mb-2">
            {{ item.name }}
            <span v-if="item.process !== 100" class="font-bold">{{
              item.process + "%"
            }}</span>
            <span v-if="item.isScan" class="ml-2" style="color: #ffcc66"
              >Scanning...</span
            >
          </div>
          <div
            v-if="item.isShowProgress"
            :class="{
              'progress-bar': true,
              'progress-bar-striped': true,
              'mt-0': true,
              'h-[8px]': true,
              rounded: true,
              'progress-bar-animated': item.process === 100,
            }"
            role="progressbar"
            aria-valuenow="75"
            aria-valuemin="0"
            aria-valuemax="100"
            :style="{ width: item.process + '%' }"
          ></div>
        </div>
        <div class="hover:cursor-pointer" @click="handleDeleteFile(index)">
          X
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { v4 as uuidv4 } from "uuid";
export default {
  data() {
    return {
      files: [],
      intervalScan: {},
      maxConcurrentUploads: 3,
    };
  },
  methods: {
    handleChangeFile(event) {
      this.handleChangeListFile([...event.target.files], "file");
    },
    handleChangeFolder(event) {
      this.handleChangeListFile([...event.target.files], "folder");
    },
    handleDrop(event) {
      event.preventDefault();
      this.handleChangeListFile([...event.dataTransfer.files]);
    },
    handleOpen(val) {
      if (val == "file") {
        this.$refs.inputFile.click();
      } else {
        this.$refs.inputFolder.click();
      }
    },
    uploadFiles(file, type) {
      console.log("type", type);
      const progressItem = {
        name: file.name,
        preview: URL.createObjectURL(file),
        process: 0,
        isScan: false,
        isShowProgress: true,
      };
      const intervalId = setInterval(() => {
        progressItem.process += 20;
        if (progressItem.process == 100) {
          clearInterval(intervalId);
          progressItem.isScan = true;
          const intervalScan = setTimeout(() => {
            if (progressItem.process < 100) {
              progressItem.process += 20;
            } else {
              clearTimeout(intervalScan);
              progressItem.isScan = false;
              progressItem.isShowProgress = false;
            }
          }, 3000);
        }
      }, 1000);
      this.files.push(progressItem);
    },
    handleChangeListFile(files, type) {
      console.log("files", files);
      files.forEach((item) => {
        this.uploadFiles(item, type);
      });
    },
    handleDeleteFile(index) {
      this.files.splice(index, 1);
    },
  },
};
</script>

<style src="../assets/uploadFile.css" scoped />
