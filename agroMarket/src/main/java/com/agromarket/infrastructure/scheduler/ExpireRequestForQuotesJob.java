package com.agromarket.infrastructure.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.rfq.RequestForQuote;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.ports.out.rfq.RequestForQuotePort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpireRequestForQuotesJob {

    private final RequestForQuotePort requestForQuotePort;

    @Scheduled(fixedDelayString = "${app.scheduler.rfq-delay-ms:300000}")
    public void expireRequestsForQuote() {

        List<RequestForQuote> requests = requestForQuotePort.findAllActive();

        LocalDateTime now = LocalDateTime.now();

        int expired = 0;

        for (RequestForQuote request : requests) {

            if (request.getDeadline() == null) {
                continue;
            }

            if (!request.getDeadline()
                    .isAfter(now)
                    && request.getStatus() == RequestForQuoteStatus.OPEN) {

                request.setStatus(
                        RequestForQuoteStatus.EXPIRED);

                requestForQuotePort.save(request);

                expired++;
            }
        }

        if (expired > 0) {
            log.info(
                    "Solicitudes RFQ expiradas: {}",
                    expired);
        }
    }
}