package com.agromarket.application.adapters.api.controllers.image;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agromarket.application.adapters.api.response.image.ImageResponse;
import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.ports.in.image.ImagePort;
import com.agromarket.domain.ports.in.image.ImageResult;
import com.agromarket.domain.ports.in.image.ImageUploadCommand;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

        private final ImagePort imagePort;

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ImageResponse> upload(
                        @RequestPart("file") MultipartFile file,
                        @RequestParam Long ownerId,
                        @RequestParam ImageType type) {

                try {
                        ImageResult result = imagePort.upload(
                                        new ImageUploadCommand(
                                                        file.getBytes(),
                                                        file.getOriginalFilename(),
                                                        file.getContentType(),
                                                        ownerId,
                                                        type));

                        return ResponseEntity.status(HttpStatus.CREATED)
                                        .body(toResponse(result));

                } catch (java.io.IOException ex) {
                        throw new IllegalStateException(
                                        "No fue posible leer el archivo de imagen",
                                        ex);
                }
        }

        @GetMapping("/{id}")
        public ResponseEntity<ImageResponse> getById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                toResponse(imagePort.getById(id)));
        }

        @GetMapping("/owner/{ownerId}")
        public ResponseEntity<List<ImageResponse>> getByOwner(
                        @PathVariable Long ownerId) {

                return ResponseEntity.ok(
                                imagePort.getByOwner(ownerId)
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @GetMapping("/owner/{ownerId}/type/{type}")
        public ResponseEntity<List<ImageResponse>> getByOwnerAndType(
                        @PathVariable Long ownerId,
                        @PathVariable ImageType type) {

                return ResponseEntity.ok(
                                imagePort.getByOwnerAndType(
                                                ownerId,
                                                type)
                                                .stream()
                                                .map(this::toResponse)
                                                .toList());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deactivate(
                        @PathVariable Long id) {

                imagePort.deactivate(id);
                return ResponseEntity.noContent().build();
        }

        private ImageResponse toResponse(
                        ImageResult result) {

                return ImageResponse.fromResult(result);
        }
}
