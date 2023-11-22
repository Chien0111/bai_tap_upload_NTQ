<template>
  <div class="p-6">
    <div
      class="file-input-container"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileChange"
        multiple
      />
      <div class="file-input-label">
        <span>Chọn tệp hoặc kéo và thả vào đây</span>
      </div>
      <div v-if="selectedFiles.length > 0">
        <p>Danh sách tệp đã chọn:</p>
      </div>
    </div>
    <ul class="border border-indigo-600 my-6">
      <li
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="p-2 flex item-center border-b-2 border-indigo-600"
      >
        <div>
          <img
            :src="file.previewSrc"
            :alt="file.name"
            class="w-[50px] h-[50px]"
          />
        </div>
        <div class="p-2 flex-1">
          <div class="flex justify-between">
            <span>
              {{ file.name }}
              <span v-if="file.uploadProgress > 1" class="font-bold">{{
                file.uploadProgress + "%"
              }}</span>
              <span v-else class="text-amber-500">Pending</span>
            </span>
            <span class="hover:cursor-pointer" @click="removeFile(index)"
              >X</span
            >
          </div>
          <div class="progress">
            <div
              v-if="file.uploadProgress !== undefined"
              :class="{
                'progress-bar': true,
                'progress-bar-striped': true,
                'mt-0': true,
                'h-[8px]': true,
                rounded: true,
                'progress-bar-animated': file.uploadProgress > 80,
              }"
              role="progressbar"
              aria-valuenow="75"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{ width: file.uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </li>
    </ul>
    <button @click="handleSubmit" class="w-full bg-slate-200 py-3 font-bold">
      Gửi
    </button>
  </div>
</template>

<script>
export default {
  name: "UploadFile",
  data() {
    return {
      selectedFiles: [],
      fileInputActive: false,
      uploading: false,
      maxConcurrentUploads: 3,
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFiles = [
        ...this.selectedFiles,
        ...this.getFileListFromEvent(event),
      ];
      this.previewFiles();
      this.uploadFiles();
    },

    openFilePicker() {
      this.$refs.fileInput.click();
    },

    handleDragOver(event) {
      this.fileInputActive = true;
    },

    handleDrop(event) {
      if (this.fileInputActive) {
        this.fileInputActive = false;
        this.handleFileChange(event);
      }
    },

    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    async uploadFiles() {
      // Chờ một khoảng thời gian rồi kiểm tra lại
      while (this.uploading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.uploading = true; // Bắt đầu quá trình upload
      try {
        const uploadPromises = [];
        for (let index = 0; index < this.selectedFiles.length; index++) {
          const file = this.selectedFiles[index];

          // Kiểm tra xem upload đã đạt 100 chưa
          if (file.uploadProgress === 100) {
            continue; // Nếu đã đạt 100, bỏ qua và chuyển sang file tiếp theo
          }

          // Bắt đầu tải lên từng file
          const uploadPromise = this.uploadFile(file, index);
          uploadPromises.push(uploadPromise);

          // Nếu đạt số lượng file tải lên đồng thời, chờ tất cả kết thúc và tiếp tục
          if (uploadPromises.length >= this.maxConcurrentUploads) {
            await Promise.all(uploadPromises);
            uploadPromises.length = 0; // Đặt lại mảng promises
          }
        }
        await Promise.all(uploadPromises);
      } finally {
        this.uploading = false; // Kết thúc quá trình upload
      }
    },

    async uploadFile(file, index) {
      await this.uploadProgress(file, index, 20);
      await this.uploadProgress(file, index, 40);
      await this.uploadProgress(file, index, 60);
      await this.uploadProgress(file, index, 80);
      await this.uploadProgress(file, index, 100);
    },

    async uploadProgress(file, index, progress) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProgress = Math.min(progress, 100); // Đảm bảo không vượt quá 100
          this.$set(this.selectedFiles, index, {
            ...file,
            uploadProgress: newProgress,
          });

          resolve();
        }, progress * 10); // Thay đổi giá trị này nếu cần điều chỉnh tốc độ upload
      });
    },

    getFileListFromEvent(event) {
      if (event.dataTransfer) {
        return Array.from(event.dataTransfer.files).map((file) => ({
          name: file.name,
          previewSrc: URL.createObjectURL(file),
        }));
      } else if (event.target.files) {
        return Array.from(event.target.files).map((file) => ({
          name: file.name,
          previewSrc: URL.createObjectURL(file),
        }));
      }
    },

    handleSubmit() {
      console.log("Files submitted:", this.selectedFiles);
    },

    previewFiles() {
      this.selectedFiles.forEach((file) => {
        if (!file.previewSrc) {
          file.previewSrc = URL.createObjectURL(file);
        }
      });
    },
  },
};
</script>

<style scoped>
.file-input-container {
  position: relative;
  overflow: hidden;
  border: 2px dashed #3498db;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.file-input-label {
  display: block;
}

.file-input-label span {
  display: block;
}

.file-input-label span:last-child {
  font-weight: bold;
}

.file-input-container.active {
  border-color: #2ecc71;
}

.file-input-label span {
  display: block;
  cursor: pointer;
}

.file-input-label span:hover {
  color: red;
}
.progress {
  background: white !important;
  border-radius: 0 !important;
}
.progress-bar {
  background-color: #db9834;
}

.progress-bar div {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.3s ease-in-out;
}
.progress-bar-striped {
  background-image: linear-gradient(
    125deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
}
</style>
