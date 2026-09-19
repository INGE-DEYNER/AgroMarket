package com.agromarket.application.usecases.image;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.agromarket.domain.exceptions.image.ImageNotFoundException;
import com.agromarket.domain.models.enums.image.ImageType;
import com.agromarket.domain.models.image.Image;
import com.agromarket.domain.ports.in.image.ImagePort;
import com.agromarket.domain.ports.in.image.ImageResult;
import com.agromarket.domain.ports.in.image.ImageUploadCommand;
import com.agromarket.domain.ports.out.image.FileStoragePort;
import com.agromarket.domain.ports.out.image.FileUploadResult;
import com.agromarket.domain.services.image.ImageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageUseCase implements ImagePort {

    private final com.agromarket.domain.ports.out.image.ImagePort imagePersistencePort;
    private final FileStoragePort fileStoragePort;
    private final ImageService imageService;

    @Override
    public ImageResult upload(
            ImageUploadCommand command) {

        validateCommand(command);

        Image pending = Image.builder()
                .fileName(command.fileName())
                .contentType(command.contentType())
                .size((long) command.content().length)
                .type(command.type())
                .ownerId(command.ownerId())
                .build();

        imageService.validate(pending);

        try {
            FileUploadResult uploaded = fileStoragePort.upload(
                    command.content(),
                    command.fileName(),
                    command.contentType());

            Image image = Image.builder()
                    .url(uploaded.url())
                    .publicId(uploaded.publicId())
                    .fileName(command.fileName())
                    .contentType(command.contentType())
                    .size((long) command.content().length)
                    .type(command.type())
                    .ownerId(command.ownerId())
                    .createdAt(LocalDateTime.now())
                    .active(true)
                    .build();

            imageService.validate(image);

            return ImageResult.fromDomain(
                    imagePersistencePort.save(image));

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "No fue posible cargar la imagen",
                    ex);
        }
    }

    @Override
    public ImageResult getById(Long id) {
        return ImageResult.fromDomain(
                imagePersistencePort.findById(id)
                        .orElseThrow(() -> new ImageNotFoundException(
                                "No existe la imagen con id " + id)));
    }

    @Override
    public List<ImageResult> getByOwner(
            Long ownerId) {

        return imagePersistencePort
                .findByOwnerId(ownerId)
                .stream()
                .map(ImageResult::fromDomain)
                .toList();
    }

    @Override
    public List<ImageResult> getByOwnerAndType(
            Long ownerId,
            ImageType type) {

        return imagePersistencePort
                .findByOwnerIdAndType(
                        ownerId,
                        type)
                .stream()
                .map(ImageResult::fromDomain)
                .toList();
    }

    @Override
    public void deactivate(Long id) {

        Image image = imagePersistencePort.findById(id)
                .orElseThrow(() -> new ImageNotFoundException(
                        "No existe la imagen con id " + id));

        if (!image.isActive()) {
            return;
        }

        image.setActive(false);
        imagePersistencePort.save(image);

        if (image.getPublicId() != null
                && !image.getPublicId().isBlank()) {

            fileStoragePort.delete(
                    image.getPublicId());
        }
    }

    private void validateCommand(
            ImageUploadCommand command) {

        if (command == null) {
            throw new IllegalArgumentException(
                    "El comando de upload es obligatorio");
        }

        if (command.content() == null
                || command.content().length == 0) {

            throw new IllegalArgumentException(
                    "El contenido de la imagen es obligatorio");
        }

        if (command.fileName() == null
                || command.fileName().isBlank()) {

            throw new IllegalArgumentException(
                    "El nombre del archivo es obligatorio");
        }

        if (command.contentType() == null
                || command.contentType().isBlank()) {

            throw new IllegalArgumentException(
                    "El tipo de contenido es obligatorio");
        }
    }
}
