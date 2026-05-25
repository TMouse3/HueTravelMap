package com.mouse3.hue_travel_map.exception;

public class AccountLockedException
        extends RuntimeException {

    public AccountLockedException(String message) {
        super(message);
    }
}
